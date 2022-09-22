import { CommandInteraction } from "discord.js";
import { IBot } from "../../utils/interfaces/IBot";
import { ISlashCommand } from "../../utils/interfaces/ISlashCommand";

module.exports = {
    name: "ping",
    category: "Other Commands",
    subcategory: "General",
    ignoreNotSameVoiceChannels: true,
    description: "Shows the bot's ping",
    botPermissions: ['SendMessages', 'EmbedLinks'],
    
    execute: async (bot: IBot, interaction: CommandInteraction) => {
        if (!interaction.isChatInputCommand()) return;

        await interaction.deferReply();

        const ping = Date.now() - interaction.createdTimestamp;
        await interaction.editReply(`🏓 Pong!\nLatency is ${ping}ms`);
    }
} as ISlashCommand