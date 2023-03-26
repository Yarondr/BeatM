import { CommandInteraction, SlashCommandBuilder } from "discord.js";
import { IBot } from "../../../utils/interfaces/IBot";
import { ISlashCommand } from "../../../utils/interfaces/ISlashCommand";

module.exports = {
    data: new SlashCommandBuilder()
        .setName("bassboost")
        .setDescription("Apply bass to the music")
        .setDMPermission(false),
    category: "Music Commands",
    botPermissions: ['SendMessages', 'EmbedLinks'],

    execute: async (bot: IBot, interaction: CommandInteraction) => {
        if (!interaction.isChatInputCommand()) return;
        const player = bot.manager.get(interaction.guildId!)! as any;
                
        player.bassboost = true;
        
        return interaction.editReply(`Filter **${module.exports.data.name}** has been applied to the music!`);
    }

} as ISlashCommand;