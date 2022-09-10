import { EmbedBuilder, SelectMenuInteraction } from "discord.js";
import { getSubcategoryCommands } from "../../../handlers/slashCommandsHandler";
import { IBot } from "../../../utils/interfaces/IBot";
import { IDropdown } from "../../../utils/interfaces/IDropdown";

module.exports = {
    execute: async (bot: IBot, interaction: SelectMenuInteraction) => {
        const commands = getSubcategoryCommands(bot, "Filters");

        const embed = new EmbedBuilder()
            .setColor("Random")
            .setTitle("**🎼 Filters Control Commands**")

        commands.forEach((command) => {
            embed.addFields(
                {name: command.originalName!, value: command.description}
            )
        });

        return await interaction.editReply({embeds: [embed]});
    }
} as IDropdown