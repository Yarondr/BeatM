import * as fs from 'fs';

const configFile = 'config.json';

function getConfig() {
    return JSON.parse(fs.readFileSync(configFile, 'utf8'));
}

export function getBotToken(): string {
    return getConfig().token;
}

export function getBotOwners(): string[] {
    return getConfig().ownersIDs;
}

export function getTestServers(): string[] {
    return getConfig().testServers;
}

export function getLavalinkNodes(): any[] {
    return getConfig().lavalink.nodes;
}

export function getSpotifyClientID(): string {
    return getConfig().spotify.clientID;
}

export function getSpotifyClientSecret(): string {
    return getConfig().spotify.clientSecret;
}