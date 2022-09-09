import { Queue } from "discord-player";
import { ButtonInteraction, GuildMember } from "discord.js";
import { IBot } from "../../utils/interfaces/IBot";
import { embedContent } from "../../utils/embedContent";
import { IButton } from "../../utils/interfaces/IButton";
import { IQueueMetadata } from "../../utils/interfaces/IQueueMetadata";
import { skip } from "../../utils/player";
import { ICommandArgs } from "../../utils/interfaces/ICommandArgs";

module.exports = {
    execute: async (bot: IBot, queue: Queue<IQueueMetadata>, interaction: ButtonInteraction, args: ICommandArgs) => {     
        const { member } = args;
           
        if (!queue.current) {
            return interaction.editReply({ embeds: [embedContent("Can't skip, I am not playing anything right now!", member)] });
        }

        await skip(member, queue, interaction);
    }
} as IButton