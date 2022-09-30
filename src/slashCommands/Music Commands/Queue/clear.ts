import { CommandInteraction, SlashCommandBuilder } from "discord.js";
import { IBot } from "../../../utils/interfaces/IBot";
import { ISlashCommand } from "../../../utils/interfaces/ISlashCommand";

module.exports = {
    data: new SlashCommandBuilder()
        .setName("clear")
        .setDescription("Clears the queue")
        .setDMPermission(false),
    category: "Music Commands",
    botPermissions: ['SendMessages', 'EmbedLinks'],
    DJOnly: true,
    
    execute: async (bot: IBot, interaction: CommandInteraction) => {
        if (!interaction.isChatInputCommand()) return;
        
        let player = bot.manager.get(interaction.guildId!)!;

        await interaction.deferReply();
                
        if (player.queue.length == 0) {
            return interaction.editReply("Can't clear, the queue is already empty!");
        }

        player.queue.clear();
        await interaction.editReply("Cleared!");
    }
} as ISlashCommand