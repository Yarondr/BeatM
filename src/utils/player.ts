import { Player, PlayerSearchResult, Playlist, QueryType, Queue, Track, TrackSource } from "discord-player";
import { CommandInteraction, EmbedBuilder, Guild, GuildMember, TextChannel, VoiceBasedChannel } from "discord.js";
import { IQueueMetadata } from "./interfaces/IQueueMetadata";
import * as playdl from "play-dl";
import { Readable } from "stream";

export function convertMilisecondsToTime(miliseconds: number) {
    const date = new Date(miliseconds);
    const hours = date.getUTCHours();
    const minutes = date.getUTCMinutes() === 0  && hours > 0 ? "00" : date.getUTCMinutes();
    const seconds: string = date.getUTCSeconds() < 10 ? "0" + date.getUTCSeconds() : date.getUTCSeconds().toString();
    return hours > 0 ? `${hours}:${minutes}:${seconds}` : `${minutes}:${seconds}`;
}

export function playerDurationToMiliseconds(duration: string): number {
    const regex = /^(\d+):?(\d{1,2})?:(\d{1,2})$/;
    const matches = duration.match(regex);
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

        async onBeforeCreateStream(track: Track, source: TrackSource, queue: Queue): Promise<Readable> {
            if (track.url.includes("spotify.com")) source = "spotify";
            if (source == "youtube") {
                const stream = await playdl.stream(track.url, { discordPlayerCompatibility: true });
                return stream.stream;
            } else if (source == "spotify") {
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
    const search = interaction.options.getString('search-query')!
    if (!connected) await channel.send("Searching...");
    else await interaction.editReply("Searching...");
    return await player.search(search, {
        requestedBy: member,
        searchEngine: QueryType.AUTO,
    });
}

export async function play(queue: Queue<IQueueMetadata>, res: PlayerSearchResult, member: GuildMember, interaction: CommandInteraction, index:number = 0) {
    if (!queue.playing) {
        await queue.play();
        const embed = buildPlayEmbed(res, `Playing "${res.tracks[index].title}"`, member);
        await queue.metadata!.channel.send({embeds: [embed]});
    } else {
        const title = res.playlist ? res.playlist.title : res.tracks[index].title;
        const embed = buildPlayEmbed(res, `Added "${title}" to queue`, member);
        await interaction.editReply({embeds: [embed]});
    }
}

export async function joinChannel(connected: boolean, queue: Queue<IQueueMetadata>, member: GuildMember, interaction: CommandInteraction, player: Player, guild: Guild, channel: TextChannel) {
    if (!member.voice.channel) return;
    try {
        if (!connected) {
            await queue.connect(member.voice.channel);
            await interaction.editReply(`Joined \`${member.voice.channel.name}\` and bound to <#${channel.id}>`);
        } else if (queue.connection.channel.id !== member.voice.channel.id) {
            return interaction.editReply(`Can't join to \`${member.voice.channel.name}\` because I'm already in another voice channel.`);
        }
    } catch {
        player.deleteQueue(guild.id);
        return interaction.editReply(`I can't join your voice channel. Please check my permissions.`);
    }
}