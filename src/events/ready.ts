import { IBot } from "../utils/interfaces/IBot";
import { IEvent } from "../utils/interfaces/IEvent";

module.exports = {
    name: "ready",
    once: true,
    execute: async (bot: IBot, ...args: any) => {
        const { client, testServers, slashCommands } = bot;
        testServers.forEach(async serverId => {
            const guild = client.guilds.cache.get(serverId);
            if (!guild) {
                return console.log(`Server ${serverId} not found`);
            }

            await guild.commands.set([...slashCommands.values()]);
        });
        console.log("BeatM is now active!");
    }
} as IEvent