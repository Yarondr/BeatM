import { ApplicationCommandOptionType, CommandInteraction } from "discord.js";
import { IBot } from "../../../utils/interfaces/IBot";
import { ISlashCommand } from "../../../utils/interfaces/ISlashCommand";

module.exports = {
    name: "jumpto",
    category: "Music Commands",
    description: "Jump to a specific song in the queue.",
    botPermissions: ['SendMessages', 'EmbedLinks'],
    DJOnly: true,
    options: [
        {
            name: "song-number",
            description: "The number of the song to remove",
            type: ApplicationCommandOptionType.Integer,
            minValue: 1,
            required: true,
        }
    ],
    
    execute: async (bot: IBot, interaction: CommandInteraction) => {
        if (!interaction.isChatInputCommand()) return;
        
        const songIndex = interaction.options.getInteger('song-number')! -1;
        let queue = bot.player.getQueue(interaction.guildId!);

        await interaction.deferReply();

        if (queue.tracks.length === 0) {
            return interaction.editReply("Can't jump to a song when there are no songs in the queue!");
        }
        if (songIndex >= queue.tracks.length) {
            return interaction.editReply("Invalid song number!");
        }

        queue.skipTo(songIndex);
        return interaction.editReply(`Jumped to song number ${songIndex + 1}!`);
    }
} as ISlashCommand