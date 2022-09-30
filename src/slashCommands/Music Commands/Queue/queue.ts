import { ApplicationCommandOptionType, CommandInteraction, SlashCommandBuilder } from "discord.js";
import { IBot } from "../../../utils/interfaces/IBot";
import { ISlashCommand } from "../../../utils/interfaces/ISlashCommand";
import { designQueue } from "../../../utils/queueDesigner";

module.exports = {
    data: new SlashCommandBuilder()
        .setName("queue")
        .setDescription("Show the current queue")
        .setDMPermission(false)
        .addNumberOption(option => option
            .setName("page")
            .setDescription("The page number to show")
            .setRequired(false)
            .setMinValue(1)),
    category: "Music Commands",
    botPermissions: ["SendMessages", 'EmbedLinks'],

    execute: async (bot: IBot, interaction: CommandInteraction) => {
        if (!interaction.isChatInputCommand()) return;
        
        const guild = bot.client.guilds.cache.get(interaction.guildId!)!;
        const player = bot.manager.get(interaction.guildId!)!;
        const queue = player.queue;

        await interaction.deferReply();

        if (!queue.current && queue.length == 0) {
            return interaction.editReply("The queue is empty!\nUse the /play command to add a song to the queue.");
        }

        const totalPages = Math.ceil(queue.length / 10) || 1;
        const page = (interaction.options.getNumber('page') || 1) - 1;
        if (page + 1 > totalPages) {
            return await interaction.editReply(`Invalid Page. There are only a total of ${totalPages} pages.`);
        }
        const embed = await designQueue(player, guild, page);
        await interaction.editReply({embeds: [embed]});

    }

} as ISlashCommand;