import { IBot } from "../utils/interfaces/IBot";
import { IEvent } from "../utils/interfaces/IEvent";

module.exports = {
    name: "ready",
    once: true,
    execute: async (bot: IBot, ...args: any) => {
        const { client, testServers, slashCommands } = bot;
        let count = 0;
        // testServers.forEach(async serverId => {
        //     const guild = client.guilds.cache.get(serverId.toString());
        //     if (!guild) {
        //         return console.log(`Server ${serverId.toString()} not found`);
        //     }
        //     count++;

        //     await guild.commands.set([...slashCommands.values()]);
        // });
        bot.manager.init(bot.client.user?.id)
        console.log(`Loaded ${count} servers`);
        console.log("BeatM is now active!");
    }
} as IEvent