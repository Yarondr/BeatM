console.log("Starting bot...")
import { Client, GatewayIntentBits, Collection } from 'discord.js';
import dotenv from 'dotenv';
import { loadEvents } from './handlers/eventsHandler';
import { loadCommands } from './handlers/commandsHandler';
import { loadSlashCommands } from './handlers/slashCommandsHandler';
import { IBot } from './utils/interfaces/IBot';
import { ISlashCommand } from './utils/interfaces/ISlashCommand';
import { IEvent } from './utils/interfaces/IEvent';
import { ICommand } from './utils/interfaces/ICommand';
import { Player } from 'discord-player';
import { IQueueMetadata } from './utils/interfaces/IQueueMetadata';
dotenv.config();

const myTestServerId = process.env.TEST_SERVER || '';
const testServers = [myTestServerId];

export const owners = [process.env.OWNER_ID || ''];

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMembers,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.GuildVoiceStates,
    ]
});

const commands = new Collection<string, ICommand>();
const events = new Collection<string, IEvent>();
const slashCommands = new Collection<string, ISlashCommand>();

const bot: IBot = {
    client,
    commands,
    events,
    slashCommands,
    owners,
    testServers,
    prefix: '!',
    player: new Player(client, {
        ytdlOptions: {
            quality: 'highestaudio',
            highWaterMark: 1 << 25
        }
    })
};

bot.player.on('trackStart', (queue, track) => {
    // TODO: check if event called on track repeat too
    const metadata = queue.metadata as IQueueMetadata;
    metadata.skipVotes = [];
});

loadEvents(bot, false);
loadCommands(bot, false);
loadSlashCommands(bot, false);

client.login(process.env.TOKEN);

/**
 * TODO:
 * V play
 * V join
 * V disconnect
 * V queue
 * V shuffle
 * V nowplaying
 * V skip
 * V pause
 * V resume
 * V force skip
 * V forward
 * V backward
 * V skip to
 * V back
 * V clear queue
 * V loop
 * V queue loop
 * V remove from queue
 * V stop
 * V volume
 * V play next
 * - save
 * - search
 * - jump to track
 * - controller
 * V move track (to another position in queue)
 */
