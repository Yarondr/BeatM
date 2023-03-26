import { CommandInteraction, SlashCommandBuilder } from "discord.js";
import { IBot } from "../../utils/interfaces/IBot";
import { ISlashCommand } from "../../utils/interfaces/ISlashCommand";

module.exports = {
    data: new SlashCommandBuilder()
        .setName("ping")
        .setDescription("Shows the bot's ping")
        .setDMPermission(false),
    category: "Other Commands",
    subcategory: "General",
    ignoreNotSameVoiceChannels: true,
    botPermissions: ['SendMessages', 'EmbedLinks'],
    
    execute: async (bot: IBot, interaction: CommandInteraction) => {
        if (!interaction.isChatInputCommand()) return;

        const ping = Date.now() - interaction.createdTimestamp;
        await interaction.editReply(`🏓 Pong!\nLatency is ${ping}ms`);
    }
} as ISlashCommand