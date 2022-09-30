console.log("Starting bot...")
import { Manager } from '@yarond/erela.js';
import Filter from '@yarond/erela.js-filters';
import Spotify from '@yarond/erela.js-spotify';
import { Client, Collection, GatewayIntentBits, REST, RESTPostAPIApplicationCommandsJSONBody, Routes } from 'discord.js';
import { loadEvents } from './handlers/eventsHandler';
import { loadSlashCommands } from './handlers/slashCommandsHandler';
import { getBotOwners, getBotToken, getLavalinkNodes, getSpotifyClientID, getSpotifyClientSecret, getTestServers, loadConfig } from './utils/config/config';
import { IBot } from './utils/interfaces/IBot';
import { IEvent } from './utils/interfaces/IEvent';
import { ISlashCommand } from './utils/interfaces/ISlashCommand';

// load config
if (!loadConfig()) {
    throw new Error("Config file created, please fill it out and restart the bot.");
}


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
    owners: getBotOwners(),
    testServers: getTestServers(),
    manager: new Manager(
        {
            nodes: getLavalinkNodes(),
            send: (id, payload) => {
                const guild = client.guilds.cache.get(id);
                if (guild) guild.shard.send(payload);
            },
            plugins: [
                new Spotify({
                    clientID: getSpotifyClientID(),
                    clientSecret: getSpotifyClientSecret()
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

const rest = new REST({ version: '10' }).setToken(getBotToken());

(async () => {
	try {
		console.log(`Started refreshing ${bot.slashCommands.size} application (/) commands.`);

        const commands: RESTPostAPIApplicationCommandsJSONBody[] = [];
        bot.slashCommands.mapValues((command) => {
            commands.push(command.data.toJSON());
        });

		const data = await rest.put(
			Routes.applicationCommands('887024111275114528'),
			{ body: commands },
		);

		// console.log(`Successfully reloaded ${data} application (/) commands.`);
	} catch (error) {
		console.error(error);
	}
})();

client.login(getBotToken());