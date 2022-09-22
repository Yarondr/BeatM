import * as fs from 'fs';
import { env } from 'process';

const configFile = 'config.json';
const defaultConfigFile = 'config.example.json';

let config: any | undefined;

export function loadConfig() {
    if (!fs.existsSync(configFile)) {
        console.log('Config file not found, creating one...');
        fs.copyFileSync(defaultConfigFile, configFile);
        return false;
    }
    config = JSON.parse(fs.readFileSync(configFile, 'utf-8'));
    env.SPOTIFY_CLIENT_ID = getSpotifyClientID();
    env.SPOTIFY_CLIENT_SECRET = getSpotifyClientSecret();
    return true;
}

export function reloadConfig() {
    config = JSON.parse(fs.readFileSync(configFile, 'utf-8'));
}

export function getBotToken(): string {
    return config.token;
}

export function getBotOwners(): string[] {
    return config.ownersIDs;
}

export function getTestServers(): string[] {
    return config.testServers;
}

export function getLavalinkNodes(): any[] {
    return config.lavalink.nodes;
}

export function getSpotifyClientID(): string {
    return config.spotify.clientID;
}

export function getSpotifyClientSecret(): string {
    return config.spotify.clientSecret;
}