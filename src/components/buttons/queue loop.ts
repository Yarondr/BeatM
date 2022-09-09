import { Queue, QueueRepeatMode } from "discord-player";
import { ButtonInteraction } from "discord.js";
import { embedContent } from "../../utils/embedContent";
import { IBot } from "../../utils/interfaces/IBot";
import { IButton } from "../../utils/interfaces/IButton";
import { ICommandArgs } from "../../utils/interfaces/ICommandArgs";
import { IQueueMetadata } from "../../utils/interfaces/IQueueMetadata";

module.exports = {
    execute: async (bot: IBot, queue: Queue<IQueueMetadata>, interaction: ButtonInteraction, args: ICommandArgs) => {
        const { member } = args;
        
        if (!queue.current) {
            return interaction.editReply("Can't loop, I am not playing anything right now!");
        }

        if (queue.repeatMode != QueueRepeatMode.QUEUE) {
            queue.setRepeatMode(QueueRepeatMode.QUEUE);
            return interaction.editReply({ embeds: [embedContent("Queue looped!", member)] });
        } else {
            queue.setRepeatMode(QueueRepeatMode.OFF);
            return interaction.editReply({ embeds: [embedContent("Queue loop disabled!", member)] });
        }
    }
} as IButton