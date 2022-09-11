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
        
        const player = bot.manager.get(interaction.guildId!)!;

        await interaction.deferReply();
        
        if (!player.queue.current) {
            return interaction.editReply("Can't pause, I am not playing anything right now!");
        }
        
        if (player.paused) {
            player.pause(false);
            return interaction.editReply("Resumed the track.");
        } else {    
            player.pause(true);
            return interaction.editReply("Paused the track!");
        }
    }

} as ISlashCommand;