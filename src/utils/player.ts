import { Manager, Player, PlaylistInfo, Queue, SearchResult, Track, UnresolvedTrack } from '@yarond/erela.js';
import { ButtonInteraction, CommandInteraction, EmbedBuilder, Guild, GuildMember, TextChannel, VoiceBasedChannel } from "discord.js";
import { embedContent } from "./embedContent";
import { IBot } from "./interfaces/IBot";

export function convertMilisecondsToTime(time: number) {
    const date = new Date(time);
    const hours = date.getUTCHours();
    const minutes = date.getUTCMinutes() === 0  && hours > 0 ? "00" : date.getUTCMinutes();
    const seconds: string = date.getUTCSeconds() < 10 ? "0" + date.getUTCSeconds() : date.getUTCSeconds().toString();
    return hours > 0 ? `${hours}:${minutes}:${seconds}` : `${minutes}:${seconds}`;
}

export function playerDurationToMiliseconds(duration: string): number {
    const regex = /^(\d+):?(\d{1,2})?:(\d{1,2})$/;
    const matches = duration.match(regex)?.filter((match) => match !== undefined);
    if (!matches) return 0;
    let [_, hours, minutes, seconds]: number[] = matches.map(Number);
    if (!seconds) {
        seconds = minutes;
        minutes = hours;
        hours = 0;
    }

    return (hours * 60 * 60 + minutes * 60 + seconds) * 1000;
}

export function playlistLength(playlist: PlaylistInfo) {
    return convertMilisecondsToTime(playlist.duration);
}

export function isTrackLive(track: Track | UnresolvedTrack) {
    return track.duration === 0 || track.isStream;
}

export function haveLiveTrack(queue: Queue) {
    return queue.some(track => isTrackLive(track));
}

export function checkSkippingPlayers(skip_votes: string[], voice: VoiceBasedChannel) {
    const memberIds = voice.members.map(member => member.id);
    return skip_votes.filter(id => memberIds.includes(id));
}

export function createPlayer(guild: Guild, manager: Manager, voiceChannel: VoiceBasedChannel, textChannel: TextChannel) {
    let player = manager.get(guild.id);
    if (player) return player;

    player = manager.create({
        guild: guild.id,
        voiceChannel: voiceChannel.id,
        textChannel: textChannel.id,
        selfDeafen: true,
    });
    player.set("voiceChannel", voiceChannel);
    player.set("textChannel", textChannel);
    player.set("skip_votes", []);
    player.set("autoplay", false);
    player.set("previoustrack", undefined);
    player.set("previousqueue", undefined);
    return player;
}

export function isDJ(member: GuildMember) {
    return member.permissions.has("ManageGuild") || member.roles.cache.some(r => r.name === "DJ")
}

export function buildPlayEmbed(res: SearchResult, embedTitle: string, requester: string, index:number = 0) {
    const track = res.tracks[index];
    const url = res.playlist ? res.playlist.selectedTrack?.originalUri! : track.originalUri!;
    let duration = res.playlist ? playlistLength(res.playlist) : convertMilisecondsToTime(track.duration);
    if (!res.playlist && isTrackLive(track)) duration = "LIVE";

    return playEmbed(embedTitle, track, url, undefined, requester);
}

export function buildPlayingNowEmbed(track: Track, requester: string) {
    const title = `Now playing: "${track.originalTitle}"`;
    const url = track.originalUri!;
    const duration = isTrackLive(track) ? "LIVE" : convertMilisecondsToTime(track.duration);
    return playEmbed(title, track, url, duration, requester);
}

function playEmbed(title: string, track: Track, url: string, duration: string | undefined, requester: string) {
    const embed = new EmbedBuilder()
        .setColor("Random")
        .setTitle(title)
        // TODO: support spotify thumbnail
        .setThumbnail(track.thumbnail)
        .setURL(url)
        .addFields(
            {name: 'Requested By:', value: requester},
        )
        .setTimestamp();
        // TODO: set footer with loop and queue loop status
    if (duration) {
        embed.addFields({name: 'Duration:', value: duration!});
    }
    return embed;
}

export async function searchQuery(manager: Manager, member: GuildMember, interaction: CommandInteraction) {
    if (!interaction.isChatInputCommand()) return;
    const search = interaction.options.getString('search-query')!;
    await interaction.editReply("Searching...");
    return await basicSearch(member.user.tag, manager, search);
}

export async function basicSearch(requester: string, manager: Manager, search: any) {
    return await manager.search(search, requester);
}

export async function play(player: Player, res: SearchResult, member: GuildMember, interaction: CommandInteraction, index:number = 0, searchCmd: boolean = false) {
    const title = res.playlist ? res.playlist.name : res.tracks[index].originalTitle
    const embed = buildPlayEmbed(res, `Added "${title}" to queue`, member.user.tag);
    await interaction.editReply({embeds: [embed]});

    if (!player.playing && !player.paused) {
        await player.play().catch((err) => {
            console.log(err);
        });
    }
}

export async function joinChannel(bot: IBot, member: GuildMember, interaction: CommandInteraction, player: Player, guild: Guild, channel: TextChannel) {
    if (!member.voice.channel) return;
    try {
        if (player.state != "CONNECTED" && player.state != "CONNECTING") {
            player.connect();
            await interaction.editReply(`Joined \`${member.voice.channel.name}\` and bound to <#${channel.id}>`);
        } else if (player.voiceChannel !== member.voice.channel.id) {
            return interaction.editReply(`Can't join to \`${member.voice.channel.name}\` because I'm already in another voice channel.`);
        }
    } catch {
        player.destroy();
        return interaction.editReply(`I can't join your voice channel. Please check my permissions.`);
    }
}

export async function skip(member: GuildMember, player: Player, interaction: CommandInteraction | ButtonInteraction, embed: boolean = false) {
    const voiceMembers = Math.floor(member.voice.channel!.members.filter(m => !m.user.bot).size / 2);
    let skipVotes = await player.get("skip_votes") as string[];
    skipVotes = checkSkippingPlayers(skipVotes, member.voice.channel!);
    if (skipVotes.includes(member.id)) {
        return interaction.editReply("You already voted to skip this song.");
    }
    skipVotes.push(member.id);
    player.set("skip_votes", skipVotes);
    if (skipVotes.length >= voiceMembers) {
        player.stop();
        if (player.paused) {
            player.pause(false);
        }
        const reply = "Skipped!"
        if (embed) {
            return interaction.editReply({embeds: [embedContent(reply, member)]});
        }
        return interaction.editReply(reply);
    } else {
        return interaction.editReply(`${skipVotes.length}/${voiceMembers} votes to skip this song.`);
    }
}

export async function scheduleQueueLeave(bot: IBot, player: Player | undefined, empty: boolean = false) {
    const guildId = player?.guild!;
    const map = empty ? bot.emptyChannelsWaitingToLeave : bot.queuesWaitingToLeave;

    if (map.has(guildId)) {
        clearTimeout(map.get(guildId));
    }

    map.set(guildId, setTimeout(async () => {
        player = bot.manager.get(player!.guild);
        if (!player) return;
        map.delete(player!.guild);
        player.disconnect();
        player.destroy();
        bot.manager.players.delete(player.guild);
    }, 60000));
}