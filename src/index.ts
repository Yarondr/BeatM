console.log("Starting bot...")
import { Manager } from '@yarond/erela.js';
import Filter from '@yarond/erela.js-filters';
import Spotify from '@yarond/erela.js-spotify';
import { Client, Collection, GatewayIntentBits, REST, RESTPostAPIApplicationCommandsJSONBody, Routes } from 'discord.js';
import { loadEvents } from './handlers/eventsHandler';
import { loadSlashCommands } from './handlers/slashCommandsHandler';
import { IBot } from './utils/interfaces/IBot';
import { IEvent } from './utils/interfaces/IEvent';
import { ISlashCommand } from './utils/interfaces/ISlashCommand';
import dotenv from 'dotenv';
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

const events = new Collection<string, IEvent>();
const slashCommands = new Collection<string, ISlashCommand>();

const bot: IBot = {
    client,
    events,
    slashCommands,
    owners: owners,
    testServers: testServers,
    manager: new Manager(
        {
            nodes: nodes,
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

loadEvents(bot, false);
loadSlashCommands(bot, false);

const rest = new REST({ version: '10' }).setToken(process.env.token!);

(async () => {
	try {
		console.log(`Started refreshing ${bot.slashCommands.size} slash commands.`);

        const commands: RESTPostAPIApplicationCommandsJSONBody[] = [];
        bot.slashCommands.mapValues((command) => {
            commands.push(command.data.toJSON());
        });

		const data = await rest.put(
			Routes.applicationCommands('887024111275114528'),
			{ body: commands },
		) as RESTPostAPIApplicationCommandsJSONBody[];
        console.log(`Successfully reloaded ${data.length} slash commands.`);
	} catch (error) {
		console.error(error);
	}
})();

client.login(process.env.TOKEN);