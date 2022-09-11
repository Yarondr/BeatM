import { CommandInteraction } from "discord.js";
import { IBot } from "../../../utils/interfaces/IBot";
import { ISlashCommand } from "../../../utils/interfaces/ISlashCommand";

module.exports = {
    name: "clearfilters",
    category: "Music Commands",
    description: "Clear all filters from the music",
    botPermissions: ['SendMessages', 'EmbedLinks'],

    execute: async (bot: IBot, interaction: CommandInteraction) => {
        if (!interaction.isChatInputCommand()) return;
        
        const queue = bot.manager.getQueue(interaction.guildId!)!;

        await interaction.deferReply();

        queue.getFiltersEnabled().forEach(async (filter: any) => {
            await queue.setFilters({[filter]: false});
        });
        
        return interaction.editReply(`All filters have been cleared!`);
    }

} as ISlashCommand;