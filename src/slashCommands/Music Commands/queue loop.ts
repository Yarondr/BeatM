import { QueueRepeatMode } from "discord-player";
import { CommandInteraction } from "discord.js";
import { IBot } from "../../utils/interfaces/IBot";
import { ISlashCommand } from "../../utils/interfaces/ISlashCommand";

module.exports = {
    name: "queueloop",
    category: "Music Commands",
    description: "Loop the current queue",
    botPermissions: ['SendMessages', 'EmbedLinks'],
    DJOnly: true,
    
    execute: async (bot: IBot, interaction: CommandInteraction) => {
        if (!interaction.isChatInputCommand()) return;
        
        const queue = bot.player.getQueue(interaction.guildId!);

        await interaction.deferReply();
        
        if (!queue.current) {
            return interaction.editReply("Can't loop, I am not playing anything right now!");
        }
        if (queue.repeatMode != QueueRepeatMode.QUEUE) {
            queue.setRepeatMode(QueueRepeatMode.QUEUE);
            return interaction.editReply("Queue looped!");
        } else {
            queue.setRepeatMode(QueueRepeatMode.OFF);
            return interaction.editReply("Queue loop disabled!");
        }
    }
} as ISlashCommand