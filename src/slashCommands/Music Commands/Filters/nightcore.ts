import { CommandInteraction } from "discord.js";
import { IBot } from "../../../utils/interfaces/IBot";
import { ISlashCommand } from "../../../utils/interfaces/ISlashCommand";

module.exports = {
    name: "nightcore",
    category: "Music Commands",
    description: "Speed up and increase the pitch of the music",
    botPermissions: ['SendMessages', 'EmbedLinks'],

    execute: async (bot: IBot, interaction: CommandInteraction) => {
        if (!interaction.isChatInputCommand()) return;
        
        const queue = bot.manager.getQueue(interaction.guildId!)!;

        await interaction.deferReply();

        await queue.setFilters({[module.exports.name]: true});
        
        return interaction.editReply(`Filter **${module.exports.name}** has been applied to the music!`);
    }

} as ISlashCommand;