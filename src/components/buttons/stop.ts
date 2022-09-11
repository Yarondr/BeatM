import { Queue } from "discord-player";
import { ButtonInteraction, GuildMember } from "discord.js";
import { embedContent } from "../../utils/embedContent";
import { IBot } from "../../utils/interfaces/IBot";
import { IButton } from "../../utils/interfaces/IButton";
import { ICommandArgs } from "../../utils/interfaces/ICommandArgs";
import { IQueueMetadata } from "../../utils/interfaces/IQueueMetadata";
import { createPlayer } from "../../utils/player";

module.exports = {
    execute: async (bot: IBot, queue: Queue<IQueueMetadata>, interaction: ButtonInteraction, args: ICommandArgs) => {
        const { member, guild, channel } = args;

        if (!queue.current) {
            return interaction.editReply("Can't stop, I am not playing anything right now!");
        }

        queue.stop();
        queue = createPlayer(guild, bot.manager, channel);
        await queue.connect(member.voice.channel!);
        return interaction.editReply("Stopped!");
    }
} as IButton