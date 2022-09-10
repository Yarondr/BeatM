import { Player, PlayerSearchResult, Playlist, QueryType, Queue, Track, TrackSource } from "discord-player";
import { ButtonInteraction, CommandInteraction, EmbedBuilder, Guild, GuildChannelResolvable, GuildMember, TextChannel, VoiceBasedChannel } from "discord.js";
import * as playdl from "play-dl";
import { Readable } from "stream";
import { embedContent } from "./embedContent";
import { IBot } from "./interfaces/IBot";
import { IQueueMetadata } from "./interfaces/IQueueMetadata";

export function convertMilisecondsToTime(miliseconds: number) {
    const date = new Date(miliseconds);
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

export function playlistLength(playlist: Playlist) {
    let length = 0;
    playlist.tracks.forEach(track => {
        length += track.durationMS;
    })
    return convertMilisecondsToTime(length);
}

export function isTrackLive(track: Track) {
    return track.durationMS == 0;
}

export function haveLiveTrack(queue: Queue) {
    return queue.tracks.some(track => isTrackLive(track));
}

export function checkSkippingPlayers(skip_votes: string[], voice: VoiceBasedChannel) {
    const memberIds = voice.members.map(member => member.id);
    return skip_votes.filter(id => memberIds.includes(id));
}

export function createQueue(guild: Guild, player: Player, channel: TextChannel) {
    return player.createQueue(guild, {
        metadata: {
            channel,
            skipVotes: [],
        } as IQueueMetadata,

        leaveOnStop: false,
        volumeSmoothness: 0.1,

        async onBeforeCreateStream(track: Track, source: TrackSource, queue: Queue): Promise<Readable> {
            if (track.url.includes("spotify.com")) source = "spotify";
            if (source == "youtube") {
                console.log("Creating stream for youtube track");
                const stream = await playdl.stream(track.url, { discordPlayerCompatibility: true });
                return stream.stream;
            } else if (source == "spotify") {
                console.log("Creating stream for spotify track");
                const search = await playdl.search(`${track.author} ${track.title} lyrics`,
                    { limit: 1, source: { youtube: "video"}}).then(res => res[0].url);
                const stream = await playdl.stream(search, { discordPlayerCompatibility: true });
                return stream.stream;
            } else {
                const stream = await playdl.stream(track.url, { discordPlayerCompatibility: true });
                return stream.stream;
            }
        },
    });
}

export function isDJ(member: GuildMember) {
    return member.permissions.has("ManageGuild") || member.roles.cache.some(r => r.name === "DJ")
}

export function buildPlayEmbed(res: PlayerSearchResult, embedTitle: string, member: GuildMember, index:number = 0) {
    const track = res.tracks[index];
    const url = res.playlist ? res.playlist.url : track.url;
    let duration = res.playlist ? playlistLength(res.playlist) : convertMilisecondsToTime(track.durationMS);
    if (!res.playlist && isTrackLive(track)) duration = "LIVE";

    return new EmbedBuilder()
        .setColor("Random")
        .setTitle(embedTitle)
        // TODO: support spotify thumbnail
        .setThumbnail(track.thumbnail)
        .setURL(url)
        .addFields(
            {name: 'Requested By:', value: member.user.tag},
            {name: 'Duration:', value: duration}
        )
        .setTimestamp();
        // TODO: set footer with loop and queue loop status
}

export async function searchQuery(connected: boolean, player: Player, member: GuildMember, interaction: CommandInteraction, channel: TextChannel) {
    if (!interaction.isChatInputCommand()) return;
    const search = interaction.options.getString('search-query')!;
    await interaction.editReply("Searching...");
    return await basicSearch(member, player, search);
}

export async function basicSearch(member: GuildMember, player: Player, search: any) {
    return await player.search(search, {
        requestedBy: member,
        searchEngine: QueryType.AUTO,
    });
}

export async function play(queue: Queue<IQueueMetadata>, res: PlayerSearchResult, member: GuildMember, interaction: CommandInteraction, index:number = 0, searchCmd: boolean = false) {
    if (!queue.playing) {
        await queue.play();
        const embed = buildPlayEmbed(res, `Playing "${res.tracks[index].title}"`, member);
        if (searchCmd) await interaction.editReply({ embeds: [embed] });
        else await queue.metadata!.channel.send({embeds: [embed]});
    } else {
        const title = res.playlist ? res.playlist.title : res.tracks[index].title;
        const embed = buildPlayEmbed(res, `Added "${title}" to queue`, member);
        await interaction.editReply({embeds: [embed]});
    }
}

export function setupOnQueueFinish(bot: IBot, queue: Queue<IQueueMetadata>, guild: Guild, player: Player, channel: TextChannel, voiceChannel: GuildChannelResolvable) {
    queue.connection.on('finish', async () => {
        scheduleQueueLeave(bot, queue, guild, channel, voiceChannel);
    });
}

export async function joinChannel(bot: IBot, connected: boolean, queue: Queue<IQueueMetadata>, member: GuildMember, interaction: CommandInteraction, player: Player, guild: Guild, channel: TextChannel) {
    if (!member.voice.channel) return;
    try {
        if (!connected) {
            const voiceChannel = member.voice.channel;
            await queue.connect(voiceChannel);
            setupOnQueueFinish(bot, queue, guild, player, channel, voiceChannel);
            await interaction.editReply(`Joined \`${member.voice.channel.name}\` and bound to <#${channel.id}>`);
        } else if (queue.connection.channel.id !== member.voice.channel.id) {
            return interaction.editReply(`Can't join to \`${member.voice.channel.name}\` because I'm already in another voice channel.`);
        }
    } catch {
        player.deleteQueue(guild.id);
        return interaction.editReply(`I can't join your voice channel. Please check my permissions.`);
    }
}

export async function skip(member: GuildMember, queue: Queue<IQueueMetadata>, interaction: CommandInteraction | ButtonInteraction, embed: boolean = false) {
    const voiceMembers = Math.floor(member.voice.channel!.members.filter(m => !m.user.bot).size / 2);
    const metadata = queue.metadata as IQueueMetadata;
    const skipVotes = checkSkippingPlayers(metadata.skipVotes, member.voice.channel!);
    if (skipVotes.includes(member.id)) {
        return interaction.editReply("You already voted to skip this song.");
    }
    skipVotes.push(member.id);
    if (skipVotes.length >= voiceMembers) {
        const success = queue.skip();
        if (queue.connection.paused) {
            queue.connection.resume();
        }
        const reply = success ? "Skipped!" : "Something went wrong...";
        if (embed) {
            return interaction.editReply({embeds: [embedContent(reply, member)]});
        }
        return interaction.editReply(reply);
    } else {
        return interaction.editReply(`${skipVotes.length}/${voiceMembers} votes to skip this song.`);
    }
}

export async function scheduleQueueLeave(bot: IBot, queue: Queue<IQueueMetadata> | undefined , guild: Guild, channel: TextChannel, voiceChannel: GuildChannelResolvable, empty: boolean = false) {
    const map = empty ? bot.emptyChannelsWaitingToLeave : bot.queuesWaitingToLeave;

    if (map.has(guild.id)) {
        clearTimeout(map.get(guild.id));
    }

    map.set(guild.id, setTimeout(async () => {
        queue = bot.player.getQueue(queue!.guild.id);
        if (!queue) {
            queue = createQueue(guild, bot.player, channel);
            await queue.connect(voiceChannel);
        }
        queue.destroy(true);
        map.delete(queue.guild.id);
    }, 60000));
}