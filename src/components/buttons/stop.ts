import { ButtonInteraction } from "discord.js";
import { Player } from '@yarond/erela.js';
import { IBot } from "../../utils/interfaces/IBot";
import { IButton } from "../../utils/interfaces/IButton";
import { ICommandArgs } from "../../utils/interfaces/ICommandArgs";

module.exports = {
    execute: async (bot: IBot, player: Player, interaction: ButtonInteraction, args: ICommandArgs) => {
        const { member, guild, channel } = args;

        if (!player.queue.current) {
            return interaction.editReply("Can't stop, I am not playing anything right now!");
        }

        player.queue.clear();
        player.stop();
        return interaction.editReply("Stopped!");
    }
} as IButton