import { ApplicationCommandOptionType, CommandInteraction, SlashCommandBuilder } from "discord.js";
import { IBot } from "../../../utils/interfaces/IBot";
import { ISlashCommand } from "../../../utils/interfaces/ISlashCommand";

module.exports = {
    data: new SlashCommandBuilder()
        .setName("remove")
        .setDescription("Remove a specific song from the queue")
        .setDMPermission(false)
        .addNumberOption(option => option
            .setName("song-number")
            .setDescription("The number of the song to remove")
            .setRequired(true)
            .setMinValue(1)),
    category: "Music Commands",
    botPermissions: ['SendMessages', 'EmbedLinks'],
    DJOnly: true,
    
    execute: async (bot: IBot, interaction: CommandInteraction) => {
        if (!interaction.isChatInputCommand()) return;
        
        const songIndex = interaction.options.getInteger('song-number')! -1;
        let player = bot.manager.get(interaction.guildId!)!;

        await interaction.deferReply();
        
        if (player.queue.length === 0) {
            return interaction.editReply("Can't remove a song from the queue, because the queue is empty!");
        }
        if (songIndex >= player.queue.length) {
            return interaction.editReply("Invalid song number!");
        }

        player.queue.splice(songIndex, 1);
        return interaction.editReply("Removed song from queue!");
    }
} as ISlashCommand