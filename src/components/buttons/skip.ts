import { ButtonInteraction } from "discord.js";
import { Player } from 'erela.js/src';
import { embedContent } from "../../utils/embedContent";
import { IBot } from "../../utils/interfaces/IBot";
import { IButton } from "../../utils/interfaces/IButton";
import { ICommandArgs } from "../../utils/interfaces/ICommandArgs";
import { skip } from "../../utils/player";

module.exports = {
    execute: async (bot: IBot, player: Player, interaction: ButtonInteraction, args: ICommandArgs) => {     
        const { member } = args;
           
        if (!player.queue.current) {
            return interaction.editReply({ embeds: [embedContent("Can't skip, I am not playing anything right now!", member)] });
        }

        return await skip(member, player, interaction);
    }
} as IButton