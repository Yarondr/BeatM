import { CommandInteraction } from "discord.js";
import { IBot } from "../../../utils/interfaces/IBot";
import { ISlashCommand } from "../../../utils/interfaces/ISlashCommand";

module.exports = {
    name: "loop",
    category: "Music Commands",
    description: "Loop the current track",
    botPermissions: ['SendMessages', 'EmbedLinks'],
    DJOnly: true,
    
    execute: async (bot: IBot, interaction: CommandInteraction) => {
        if (!interaction.isChatInputCommand()) return;
        
        const player = bot.manager.get(interaction.guildId!)!;
        
        await interaction.deferReply();
        
        if (!player.queue.current) {
            return interaction.editReply("Can't loop, I am not playing anything right now!");
        }
        if (!player.trackRepeat) {
            player.setTrackRepeat(true)
            return interaction.editReply("Looped!");
        } else {
            player.setTrackRepeat(false)
            return interaction.editReply("Loop disabled!");
        }
    }
} as ISlashCommand