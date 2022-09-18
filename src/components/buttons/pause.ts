import { ButtonInteraction } from "discord.js";
import { Player } from '@yarond/erela.js';
import { embedContent } from "../../utils/embedContent";
import { IBot } from "../../utils/interfaces/IBot";
import { IButton } from "../../utils/interfaces/IButton";
import { ICommandArgs } from "../../utils/interfaces/ICommandArgs";


module.exports = {
    execute: async (bot: IBot, player: Player, interaction: ButtonInteraction, args: ICommandArgs) => {        
        const { member } = args;
        
        if (!player.queue.current) {
            return interaction.editReply({ embeds: [embedContent("Can't pause, I am not playing anything right now!", member)] });
        }
        
        if (player.paused) {
            player.pause(false);
            return interaction.editReply({ embeds: [embedContent("Resumed the track.", member)] });
        } else {    
            player.pause(true);
            return interaction.editReply({ embeds: [embedContent("Paused the track!", member)] });
        }
    }
} as IButton