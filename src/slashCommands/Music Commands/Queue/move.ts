import { ApplicationCommandOptionType, CommandInteraction, SlashCommandBuilder } from "discord.js";
import { IBot } from "../../../utils/interfaces/IBot";
import { ISlashCommand } from "../../../utils/interfaces/ISlashCommand";

module.exports = {
    data: new SlashCommandBuilder()
        .setName("move")
        .setDescription("Move a specific song in the queue to a different position")
        .setDMPermission(false)
        .addNumberOption(option => option
            .setName("song-number")
            .setDescription("The number of the song to move")
            .setRequired(true)
            .setMinValue(1))
        .addNumberOption(option => option
            .setName("new-song-number")
            .setDescription("The new position of the song")
            .setRequired(true)
            .setMinValue(1)),
    category: "Music Commands",
    botPermissions: ['SendMessages', 'EmbedLinks'],
    DJOnly: true,
    
    execute: async (bot: IBot, interaction: CommandInteraction) => {
        if (!interaction.isChatInputCommand()) return;
        
        const songIndex = interaction.options.getNumber('song-number')! -1;
        const newSongIndex = interaction.options.getNumber('new-song-number')! -1;
        let player = bot.manager.get(interaction.guildId!)!;

        if (player.queue.length == 0) {
            return interaction.editReply("Can't move a song when there are no songs in the queue!");
        }
        if (songIndex >= player.queue.length) {
            return interaction.editReply("Invalid song number!");
        }
        if (newSongIndex >= player.queue.length) {
            return interaction.editReply("Invalid new song number!");
        }

        const song = player.queue[songIndex];
        player.queue.splice(songIndex, 1);
        player.queue.splice(newSongIndex, 0, song);
        return interaction.editReply(`Moved song to position ${newSongIndex + 1}!`);
    }
} as ISlashCommand