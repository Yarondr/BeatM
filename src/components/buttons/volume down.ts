import { ButtonInteraction } from "discord.js";
import { Player } from '@yarond/erela.js';
import { embedContent } from "../../utils/embedContent";
import { IBot } from "../../utils/interfaces/IBot";
import { IButton } from "../../utils/interfaces/IButton";
import { ICommandArgs } from "../../utils/interfaces/ICommandArgs";

module.exports = {
    execute: async (bot: IBot, player: Player, interaction: ButtonInteraction, args: ICommandArgs) => {
        const { member } = args;
        
        const volume = player.volume - 10;
        if (volume < 1 || volume > 200) {
            return interaction.editReply({ embeds: [embedContent("The volume must be between 1 and 200", member)] });
        }
        const success = player.setVolume(volume);
        const reply = success ? `The volume has been set to ${volume}` : "Failed to set the volume";
        return interaction.editReply({ embeds: [embedContent(reply, member)] });
    }
} as IButton