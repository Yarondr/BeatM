import { Queue } from "discord-player";
import { ButtonInteraction, GuildMember } from "discord.js";
import { embedContent } from "../../utils/embedContent";
import { IBot } from "../../utils/interfaces/IBot";
import { IButton } from "../../utils/interfaces/IButton";
import { ICommandArgs } from "../../utils/interfaces/ICommandArgs";


module.exports = {
    execute: async (bot: IBot, queue: Queue, interaction: ButtonInteraction, args: ICommandArgs) => {        
        const { member } = args;
        
        if (!queue.current) {
            return interaction.editReply({ embeds: [embedContent("Can't pause, I am not playing anything right now!", member)] });
        }
        
        if (queue.connection.paused) {
            queue.connection.resume();
            return interaction.editReply({ embeds: [embedContent("Resumed the track.", member)] });
        } else {    
            queue.connection.pause(true);
            return interaction.editReply({ embeds: [embedContent("Paused the track!", member)] });
        }
    }
} as IButton