import { CommandInteraction } from "discord.js";
import { IBot } from "../../../utils/interfaces/IBot";
import { ISlashCommand } from "../../../utils/interfaces/ISlashCommand";

module.exports = {
    name: "karaoke",
    category: "Music Commands",
    description: "Remove most of the vocals from the music",
    botPermissions: ['SendMessages', 'EmbedLinks'],

    execute: async (bot: IBot, interaction: CommandInteraction) => {
        if (!interaction.isChatInputCommand()) return;
        
        const queue = bot.player.getQueue(interaction.guildId!)!;

        await interaction.deferReply();

        await queue.setFilters({[module.exports.name]: true});
        
        return interaction.editReply(`Filter **${module.exports.name}** has been applied to the queue!`);
    }

} as ISlashCommand;