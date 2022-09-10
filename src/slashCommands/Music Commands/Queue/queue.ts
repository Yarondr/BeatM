import { Queue } from "discord-player";
import { ApplicationCommandOptionType, CommandInteraction } from "discord.js";
import { IBot } from "../../../utils/interfaces/IBot";
import { IQueueMetadata } from "../../../utils/interfaces/IQueueMetadata";
import { ISlashCommand } from "../../../utils/interfaces/ISlashCommand";
import { designQueue } from "../../../utils/queue";

module.exports = {
    name: "queue",
    category: "Music Commands",
    description: "Show the current queue",
    botPermissions: ["SendMessages", 'EmbedLinks'],
    options: [
        {
            name: "page",
            description: "The page number to show",
            type: ApplicationCommandOptionType.Number,
            required: false,
            minValue: 1,
        }
    ],

    execute: async (bot: IBot, interaction: CommandInteraction) => {
        if (!interaction.isChatInputCommand()) return;
        
        const guild = bot.client.guilds.cache.get(interaction.guildId!)!;
        const queue: Queue<IQueueMetadata> = bot.player.getQueue(interaction.guildId!)!;

        await interaction.deferReply();
        
        if (!queue.current && queue.tracks.length == 0) {
            return interaction.editReply("The queue is empty!\nUse the /play command to add a song to the queue.");
        }

        const totalPages = Math.ceil(queue.tracks.length / 10) || 1;
        const page = (interaction.options.getInteger('page') || 1) - 1;
        if (page + 1 > totalPages) {
            return await interaction.editReply(`Invalid Page. There are only a total of ${totalPages} pages.`);
        }
        const embed = await designQueue(queue, guild, page);
        await interaction.editReply({embeds: [embed]});

    }

} as ISlashCommand;