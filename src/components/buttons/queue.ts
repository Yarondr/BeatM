import { ButtonInteraction } from "discord.js";
import { Player } from '@yarond/erela.js';
import { embedContent } from "../../utils/embedContent";
import { IBot } from "../../utils/interfaces/IBot";
import { IButton } from "../../utils/interfaces/IButton";
import { ICommandArgs } from "../../utils/interfaces/ICommandArgs";
import { designQueue } from "../../utils/queueDesigner";

module.exports = {
    execute: async (bot: IBot, player: Player, interaction: ButtonInteraction, args: ICommandArgs) => {
        const { member, guild } = args;

        if (!player.queue.current && player.queue.length == 0) {
            return interaction.editReply({ embeds: [embedContent("The queue is empty!\nUse the /play command to add a song to the queue.", member)] });
        }

        const embed = await designQueue(player, guild, 0);
        return await interaction.editReply({embeds: [embed]});
    }
} as IButton