import { CommandInteraction } from "discord.js";
import { IBot } from "../../../utils/interfaces/IBot";
import { ISlashCommand } from "../../../utils/interfaces/ISlashCommand";

module.exports = {
    name: "queueloop",
    category: "Music Commands",
    description: "Loop the current queue",
    botPermissions: ['SendMessages', 'EmbedLinks'],
    DJOnly: true,
    
    execute: async (bot: IBot, interaction: CommandInteraction) => {
        if (!interaction.isChatInputCommand()) return;
        
        const player = bot.manager.get(interaction.guildId!)!;

        await interaction.deferReply();
        
        if (!player.queue.current) {
            return interaction.editReply("Can't loop, I am not playing anything right now!");
        }
        if (!player.queueRepeat) {
            player.setQueueRepeat(true);
            return interaction.editReply("Queue looped!");
        } else {
            player.setQueueRepeat(false);
            player.setTrackRepeat(false);
            return interaction.editReply("Queue loop disabled!");
        }
    }
} as ISlashCommand