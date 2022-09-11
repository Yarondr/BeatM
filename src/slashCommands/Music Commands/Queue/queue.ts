import { ApplicationCommandOptionType, CommandInteraction } from "discord.js";
import { IBot } from "../../../utils/interfaces/IBot";
import { IQueueMetadata } from "../../../utils/interfaces/IQueueMetadata";
import { ISlashCommand } from "../../../utils/interfaces/ISlashCommand";
import { designQueue } from "../../../utils/queueDesigner";

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
        const player = bot.manager.get(interaction.guildId!)!;
        const queue = player.queue;

        await interaction.deferReply();
        
        if (!queue.current && queue.length == 1) {
            return interaction.editReply("The queue is empty!\nUse the /play command to add a song to the queue.");
        }

        const totalPages = Math.ceil(queue.length / 10) || 1;
        const page = (interaction.options.getInteger('page') || 1) - 1;
        if (page + 1 > totalPages) {
            return await interaction.editReply(`Invalid Page. There are only a total of ${totalPages} pages.`);
        }
        const embed = await designQueue(player, guild, page);
        await interaction.editReply({embeds: [embed]});

    }

} as ISlashCommand;