import { Player, Playlist, Queue, Track, TrackSource } from "discord-player";
import { Guild, GuildMember, TextChannel, VoiceBasedChannel } from "discord.js";
import { IQueueMetadata } from "./interfaces/IQueueMetadata";
import * as playdl from "play-dl";
import { Readable } from "stream";

export function convertMilisecondsToTime(miliseconds: number) {
    const date = new Date(miliseconds);
    const hours = date.getUTCHours();
    const minutes = date.getUTCMinutes();
    const seconds: string = date.getUTCSeconds() < 10 ? "0" + date.getUTCSeconds() : date.getUTCSeconds().toString();
    return hours > 0 ? `${hours}:${minutes}:${seconds}` : `${minutes}:${seconds}`;
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