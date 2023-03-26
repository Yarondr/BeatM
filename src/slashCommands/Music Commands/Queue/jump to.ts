import { ApplicationCommandOptionType, CommandInteraction, SlashCommandBuilder } from "discord.js";
import { IBot } from "../../../utils/interfaces/IBot";
import { ISlashCommand } from "../../../utils/interfaces/ISlashCommand";

module.exports = {
    data: new SlashCommandBuilder()
        .setName("jumpto")
        .setDescription("Jump to a specific song in the queue")
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
        
        const songIndex = interaction.options.getNumber('song-number')!;
        let player = bot.manager.get(interaction.guildId!)!;

        if (player.queue.length == 0) {
            return interaction.editReply("Can't jump to a song when there are no songs in the queue!");
        }
        if (songIndex - 1 >= player.queue.length) {
            return interaction.editReply("Invalid song number!");
        }

        player.stop(songIndex);
        return interaction.editReply(`Jumped to song number ${songIndex}!`);
    }
} as ISlashCommand