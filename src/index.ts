console.log("Starting bot...")
import { Manager, Track } from '@yarond/erela.js';
import Filter from '@yarond/erela.js-filters';
import Spotify from '@yarond/erela.js-spotify';
import { Client, Collection, GatewayIntentBits, TextChannel } from 'discord.js';
import dotenv from 'dotenv';
import { loadCommands } from './handlers/commandsHandler';
import { loadEvents } from './handlers/eventsHandler';
import { loadSlashCommands } from './handlers/slashCommandsHandler';
import { IBot } from './utils/interfaces/IBot';
import { ICommand } from './utils/interfaces/ICommand';
import { IEvent } from './utils/interfaces/IEvent';
import { ISlashCommand } from './utils/interfaces/ISlashCommand';
import { basicSearch, buildPlayingNowEmbed, scheduleQueueLeave } from './utils/player';
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
            },
            plugins: [
                new Spotify({
                    clientID: process.env.SPOTIFY_CLIENT_ID || '',
                    clientSecret: process.env.SPOTIFY_CLIENT_SECRET || ''
                }),
                new Filter()
            ]
        }
    ),
    queuesWaitingToLeave: new Map<string, NodeJS.Timeout>(),
    emptyChannelsWaitingToLeave: new Map<string, NodeJS.Timeout>()
};

bot.manager.on('trackStuck', (player, track, payload) => {
    player.stop();
});

bot.manager.on('trackStart', async (player, track) => {
    player.set(`previoustrack`, track);

    if (bot.queuesWaitingToLeave.has(player.guild)) {
        clearTimeout(bot.queuesWaitingToLeave.get(player.guild));
        bot.queuesWaitingToLeave.delete(player.guild);
    }

    const textChannel = await player.get('textChannel') as TextChannel;
    if (!textChannel.permissionsFor(client.user!)?.has('SendMessages')) return;

    const embed = buildPlayingNowEmbed(track, track.requester! as string);
    await textChannel.send({ embeds: [embed] }).catch( async () => { 
        await textChannel.send("Now playing: " + track.originalTitle +
        "\n\nPlease give me the permission to send embeds in this channel.");
    });
});

bot.manager.on('queueEnd', async (player) => {
    const autoplay = await player.get('autoplay') as boolean;
    if (!autoplay) return await scheduleQueueLeave(bot, player);
    
    const track = await player.get('previoustrack') as Track | undefined;
    if (!track) return await scheduleQueueLeave(bot, player);

    const identifier = track.identifier;
    const url = `https://www.youtube.com/watch?v=${identifier}&list=RD${identifier}`;
    const res = await basicSearch(`Autoplay (enabled by ${track.requester})`, bot.manager, url);
    if (res) {
        player.queue.add(res.tracks[1]);
        await player.play().catch((err) => console.log(err));
    }
});

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
