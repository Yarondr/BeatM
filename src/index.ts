console.log("Starting bot...")
import { Client, GatewayIntentBits, Collection, VoiceChannel, StageChannel } from 'discord.js';
import dotenv from 'dotenv';
import { loadEvents } from './handlers/eventsHandler';
import { loadCommands } from './handlers/commandsHandler';
import { loadSlashCommands } from './handlers/slashCommandsHandler';
import { IBot } from './utils/interfaces/IBot';
import { ISlashCommand } from './utils/interfaces/ISlashCommand';
import { IEvent } from './utils/interfaces/IEvent';
import { ICommand } from './utils/interfaces/ICommand';
import { Player, Queue } from 'discord-player';
import { IQueueMetadata } from './utils/interfaces/IQueueMetadata';
import { createQueue, scheduleQueueLeave } from './utils/player';
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
        GatewayIntentBits.MessageContent,
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
            highWaterMark: 1 << 25,
            dlChunkSize: 0,
        }
    }),
    queuesWaitingToLeave: new Map<string, NodeJS.Timeout>(),
    emptyChannelsWaitingToLeave: new Map<string, NodeJS.Timeout>()
};

bot.player.on('trackStart', (queue, track) => {
    if (bot.queuesWaitingToLeave.has(queue.guild.id)) {
        clearTimeout(bot.queuesWaitingToLeave.get(queue.guild.id));
        bot.queuesWaitingToLeave.delete(queue.guild.id);
    }
    const metadata = queue.metadata as IQueueMetadata;
    metadata.skipVotes = [];
});

bot.player.on('debug', (queue, message) => {
    // console.log(message);
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
 * V save
 * V search
 * V jump to track
 * V controller
 * V move track (to another position in queue)
 * - help
 */
