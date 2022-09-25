import { CommandInteraction, SlashCommandBuilder } from "discord.js";
import { IBot } from "../../../utils/interfaces/IBot";
import { ISlashCommand } from "../../../utils/interfaces/ISlashCommand";

module.exports = {
    data: new SlashCommandBuilder()
        .setName("queueloop")
        .setDescription("Loop the current queue")
        .setDMPermission(false),
    category: "Music Commands",
    botPermissions: ['SendMessages', 'EmbedLinks'],
    DJOnly: true,
    
    execute: async (bot: IBot, interaction: CommandInteraction) => {
        if (!interaction.isChatInputCommand()) return;
        
        const player = bot.manager.get(interaction.guildId!)!;

        await interaction.deferReply();
        
        if (!player.queue.current) {
            return interaction.editReply("Can't loop, I am not playing anything right now!");
        }
        if (!player.queueRepeat) {
            player.setQueueRepeat(true);
            return interaction.editReply("Queue looped!");
        } else {
            player.setQueueRepeat(false);
            return interaction.editReply("Queue loop disabled!");
        }
    }
} as ISlashCommand