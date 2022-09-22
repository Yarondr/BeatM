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
        
        const songIndex = interaction.options.getInteger('song-number')!;
        let player = bot.manager.get(interaction.guildId!)!;

        await interaction.deferReply();

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