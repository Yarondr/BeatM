import { Playlist } from "discord-player";

export function convertMilisecondsToTime(miliseconds: number) {
    if (miliseconds === 0) return "LIVE";
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