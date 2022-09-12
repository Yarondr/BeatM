import { ApplicationCommandOptionType, CommandInteraction } from "discord.js";
import { IBot } from "../../../utils/interfaces/IBot";
import { ISlashCommand } from "../../../utils/interfaces/ISlashCommand";

module.exports = {
    name: "move",
    category: "Music Commands",
    description: "Move a specific song in the queue to a different position.",
    botPermissions: ['SendMessages', 'EmbedLinks'],
    DJOnly: true,
    options: [
        {
            name: "song-number",
            description: "The number of the song to move",
            type: ApplicationCommandOptionType.Integer,
            minValue: 1,
            required: true,
        },
        {
            name: "new-song-number",
            description: "The new position of the song",
            type: ApplicationCommandOptionType.Integer,
            minValue: 1,
            required: true,
        }
    ],
    
    execute: async (bot: IBot, interaction: CommandInteraction) => {
        if (!interaction.isChatInputCommand()) return;
        
        const songIndex = interaction.options.getInteger('song-number')! -1;
        const newSongIndex = interaction.options.getInteger('new-song-number')! -1;
        let player = bot.manager.get(interaction.guildId!)!;

        await interaction.deferReply();

        if (player.queue.length == 0) {
            return interaction.editReply("Can't move a song when there are no songs in the queue!");
        }
        if (songIndex >= player.queue.length) {
            return interaction.editReply("Invalid song number!");
        }
        if (newSongIndex >= player.queue.length) {
            return interaction.editReply("Invalid new song number!");
        }

        const song = player.queue[songIndex + 1];
        player.queue.splice(songIndex, 1);
        player.queue.splice(newSongIndex, 0, song);
        return interaction.editReply(`Moved song to position ${newSongIndex + 1}!`);
    }
} as ISlashCommand