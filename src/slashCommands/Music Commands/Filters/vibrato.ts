import { CommandInteraction, SlashCommandBuilder } from "discord.js";
import { IBot } from "../../../utils/interfaces/IBot";
import { ISlashCommand } from "../../../utils/interfaces/ISlashCommand";

module.exports = {
    data: new SlashCommandBuilder()
        .setName("vibrato")
        .setDescription("Add a vibrato effect to the music")
        .setDMPermission(false),
    category: "Music Commands",
    botPermissions: ['SendMessages', 'EmbedLinks'],

    execute: async (bot: IBot, interaction: CommandInteraction) => {
        if (!interaction.isChatInputCommand()) return;
        const player = bot.manager.get(interaction.guildId!)! as any;
        
        await interaction.deferReply();
                
        player.vibrato = true;
        
        return interaction.editReply(`Filter **${module.exports.data.name}** has been applied to the music!`);
    }

} as ISlashCommand;