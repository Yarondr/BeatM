import { ButtonInteraction } from "discord.js";
import { Player } from "erela.js";
import { embedContent } from "../../utils/embedContent";
import { IBot } from "../../utils/interfaces/IBot";
import { IButton } from "../../utils/interfaces/IButton";
import { ICommandArgs } from "../../utils/interfaces/ICommandArgs";

module.exports = {
    execute: async (bot: IBot, player: Player, interaction: ButtonInteraction, args: ICommandArgs) => {
        const { member } = args;
        
        if (!player.queue.current) {
            return interaction.editReply("Can't loop, I am not playing anything right now!");
        }

        if (!player.queueRepeat) {
            player.setQueueRepeat(true);
            return interaction.editReply({ embeds: [embedContent("Queue looped!", member)] });
        } else {
            player.setQueueRepeat(false);
            return interaction.editReply({ embeds: [embedContent("Queue loop disabled!", member)] });
        }
    }
} as IButton