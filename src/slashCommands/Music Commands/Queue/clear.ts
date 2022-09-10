import { CommandInteraction } from "discord.js";
import { IBot } from "../../../utils/interfaces/IBot";
import { ISlashCommand } from "../../../utils/interfaces/ISlashCommand";

module.exports = {
    name: "clear",
    category: "Music Commands",
    description: "Clears the queue",
    botPermissions: ['SendMessages', 'EmbedLinks'],
    DJOnly: true,
    
    execute: async (bot: IBot, interaction: CommandInteraction) => {
        if (!interaction.isChatInputCommand()) return;
        
        let queue = bot.player.getQueue(interaction.guildId!);

        await interaction.deferReply();
                
        if (queue.tracks.length == 0) {
            return interaction.editReply("Can't clear, the queue is already empty!");
        }

        queue.clear();
        await interaction.editReply("Cleared!");
    }
} as ISlashCommand