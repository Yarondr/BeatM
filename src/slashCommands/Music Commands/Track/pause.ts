import { CommandInteraction } from "discord.js";
import { IBot } from "../../../utils/interfaces/IBot";
import { ISlashCommand } from "../../../utils/interfaces/ISlashCommand";

module.exports = {
    name: "pause",
    category: "Music Commands",
    description: "Pause the current track",
    botPermissions: ['SendMessages', 'EmbedLinks'],

    execute: async (bot: IBot, interaction: CommandInteraction) => {
        if (!interaction.isChatInputCommand()) return;
        
        const queue = bot.player.getQueue(interaction.guildId!);

        await interaction.deferReply();
        
        if (!queue.current) {
            return interaction.editReply("Can't pause, I am not playing anything right now!");
        }
        
        if (queue.connection.paused) {
            queue.connection.resume();
            return interaction.editReply("Resumed the track.");
        } else {    
            queue.connection.pause(true);
            return interaction.editReply("Paused the track!");
        }
    }

} as ISlashCommand;