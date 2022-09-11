console.log("Starting bot...")
import { Manager } from 'erela.js';
import { Client, Collection, GatewayIntentBits } from 'discord.js';
import dotenv from 'dotenv';
import { loadCommands } from './handlers/commandsHandler';
import { loadEvents } from './handlers/eventsHandler';
import { loadSlashCommands } from './handlers/slashCommandsHandler';
import { IBot } from './utils/interfaces/IBot';
import { ICommand } from './utils/interfaces/ICommand';
import { IEvent } from './utils/interfaces/IEvent';
import { IQueueMetadata } from './utils/interfaces/IQueueMetadata';
import { ISlashCommand } from './utils/interfaces/ISlashCommand';
dotenv.config();

const testServers = process.env.TEST_SERVERS?.split(", ") || [];

export const owners = [process.env.OWNER_ID || ''];

const nodes = [
    {
        host: "localhost",
        password: "youshallnotpass",
        port: 2333,
    }
];

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
    manager: new Manager(
        {
            nodes,
            send: (id, payload) => {
                const guild = client.guilds.cache.get(id);
                if (guild) guild.shard.send(payload);
            }
        }
    ),
    queuesWaitingToLeave: new Map<string, NodeJS.Timeout>(),
    emptyChannelsWaitingToLeave: new Map<string, NodeJS.Timeout>()
};

// bot.manager.on('trackStart', (queue, track) => {
//     if (bot.queuesWaitingToLeave.has(queue.guild.id)) {
//         clearTimeout(bot.queuesWaitingToLeave.get(queue.guild.id));
//         bot.queuesWaitingToLeave.delete(queue.guild.id);
//     }
//     const metadata = queue.metadata as IQueueMetadata;
//     metadata.skipVotes = [];
// });

// bot.manager.on('debug', (queue, message) => {
//     // console.log(message);
// });

loadEvents(bot, false);
loadCommands(bot, false);
loadSlashCommands(bot, false);

client.login(process.env.TOKEN);

/**
 * TODO:
 * V play
 * V join
 * V leave
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
 * V help
 */
