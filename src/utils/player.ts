import { ButtonInteraction, CommandInteraction, EmbedBuilder, Guild, GuildChannelResolvable, GuildMember, TextChannel, VoiceBasedChannel } from "discord.js";
import { Manager, Player, PlaylistInfo, Queue, SearchResult, Track, UnresolvedTrack} from '@yarond/erela.js';
import { embedContent } from "./embedContent";
import { IBot } from "./interfaces/IBot";
import { IQueueMetadata } from "./interfaces/IQueueMetadata";

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
    return track.duration === 0;
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
    return player;
}

export function isDJ(member: GuildMember) {
    return member.permissions.has("ManageGuild") || member.roles.cache.some(r => r.name === "DJ")
}

export function buildPlayEmbed(res: SearchResult, embedTitle: string, member: GuildMember, index:number = 0) {
    const track = res.tracks[index];
    const url = res.playlist ? res.playlist.selectedTrack?.originalUri! : track.originalUri!;
    let duration = res.playlist ? playlistLength(res.playlist) : convertMilisecondsToTime(track.duration);
    if (!res.playlist && isTrackLive(track)) duration = "LIVE";

    return playEmbed(embedTitle, track, url, undefined, member);
}

export function buildPlayingNowEmbed(track: Track, requester: GuildMember) {
    const title = `Now playing: "${track.originalTitle}"`;
    const url = track.originalUri!;
    const duration = isTrackLive(track) ? "LIVE" : convertMilisecondsToTime(track.duration);
    return playEmbed(title, track, url, duration, requester);
}

function playEmbed(title: string, track: Track, url: string, duration: string | undefined, member: GuildMember) {
    const embed = new EmbedBuilder()
        .setColor("Random")
        .setTitle(title)
        // TODO: support spotify thumbnail
        .setThumbnail(track.thumbnail)
        .setURL(url)
        .addFields(
            {name: 'Requested By:', value: member.user.tag},
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
    return await basicSearch(member, manager, search);
}

export async function basicSearch(member: GuildMember, manager: Manager, search: any) {
    //TODO: in erela.js-spotify, change the search spotify method to search on youtube songs to get
    // the specific track without the original clip (like made in the original BeatM)
    return await manager.search(search, member);
}

export async function play(player: Player, res: SearchResult, member: GuildMember, interaction: CommandInteraction, index:number = 0, searchCmd: boolean = false) {
    const title = res.playlist ? res.playlist.name : res.tracks[index].originalTitle
    const embed = buildPlayEmbed(res, `Added "${title}" to queue`, member);
    await interaction.editReply({embeds: [embed]});

    if (!player.playing && !player.paused) {
        await player.play();
    }
}

//TODO:
// export function setupOnQueueFinish(bot: IBot, queue: Queue<IQueueMetadata>, guild: Guild, player: Player, channel: TextChannel, voiceChannel: GuildChannelResolvable) {
//     queue.connection.on('finish', async () => {
//         scheduleQueueLeave(bot, queue, guild, channel, voiceChannel);
//     });
// }

export async function joinChannel(bot: IBot, member: GuildMember, interaction: CommandInteraction, player: Player, guild: Guild, channel: TextChannel) {
    if (!member.voice.channel) return;
    try {
        if (player.state != "CONNECTED" && player.state != "CONNECTING") {
            const voiceChannel = member.voice.channel;
            player.connect();
            // TODO: setup queue finish event:
            // setupOnQueueFinish(bot, queue, guild, player, channel, voiceChannel);
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
    let skipVotes = player.get("skip_votes") as string[];
    skipVotes = checkSkippingPlayers(skipVotes, member.voice.channel!);
    if (skipVotes.includes(member.id)) {
        return interaction.editReply("You already voted to skip this song.");
    }
    skipVotes.push(member.id);
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

//TODO:
export async function scheduleQueueLeave(bot: IBot, player: Player | undefined , guildId: string, empty: boolean = false) {
    const map = empty ? bot.emptyChannelsWaitingToLeave : bot.queuesWaitingToLeave;

    if (map.has(guildId)) {
        clearTimeout(map.get(guildId));
    }

    map.set(guildId, setTimeout(async () => {
        player = bot.manager.get(player!.guild);
        // TODO: remove ?
        // if (!player) {
        //     player = createPlayer(guild, bot.manager, voiceChannel, channel);
        //     await player.connect();
        // }
        map.delete(player!.guild);
        player!.destroy();
        bot.manager.players.delete(player!.guild);
    }, 60000));
}