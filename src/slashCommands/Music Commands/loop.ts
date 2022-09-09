import { QueueRepeatMode } from "discord-player";
import { CommandInteraction } from "discord.js";
import { IBot } from "../../utils/interfaces/IBot";
import { ISlashCommand } from "../../utils/interfaces/ISlashCommand";

module.exports = {
    name: "loop",
    category: "Music Commands",
    description: "Loop the current track",
    botPermissions: ['SendMessages', 'EmbedLinks'],
    DJOnly: true,
    
    execute: async (bot: IBot, interaction: CommandInteraction) => {
        if (!interaction.isChatInputCommand()) return;
        
        const queue = bot.player.getQueue(interaction.guildId!);
        
        await interaction.deferReply();
        
        if (!queue.current) {
            return interaction.editReply("Can't loop, I am not playing anything right now!");
        }
        if (queue.repeatMode != QueueRepeatMode.TRACK) {
            queue.setRepeatMode(QueueRepeatMode.TRACK);
            return interaction.editReply("Looped!");
        } else {
            queue.setRepeatMode(QueueRepeatMode.OFF);
            return interaction.editReply("Loop disabled!");
        }
    }
} as ISlashCommand