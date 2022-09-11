import { ApplicationCommandOptionType, CommandInteraction } from "discord.js";
import { IBot } from "../../../utils/interfaces/IBot";
import { ISlashCommand } from "../../../utils/interfaces/ISlashCommand";

module.exports = {
    name: "remove",
    category: "Music Commands",
    description: "Remove a specific song from the queue.",
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
        let queue = bot.manager.getQueue(interaction.guildId!)!;

        await interaction.deferReply();
        
        if (queue.tracks.length === 0) {
            return interaction.editReply("Can't remove a song from the queue, because the queue is empty!");
        }
        if (songIndex >= queue.tracks.length) {
            return interaction.editReply("Invalid song number!");
        }

        queue.tracks.splice(songIndex, 1);
        return interaction.editReply("Removed song from queue!");
    }
} as ISlashCommand