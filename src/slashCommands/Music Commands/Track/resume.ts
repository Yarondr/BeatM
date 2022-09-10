import { CommandInteraction } from "discord.js";
import { IBot } from "../../../utils/interfaces/IBot";
import { ISlashCommand } from "../../../utils/interfaces/ISlashCommand";

module.exports = {
    name: "resume",
    category: "Music Commands",
    description: "Resume the current track",
    botPermissions: ['SendMessages', 'EmbedLinks'],

    execute: async (bot: IBot, interaction: CommandInteraction) => {
        if (!interaction.isChatInputCommand()) return;
        
        const queue = bot.player.getQueue(interaction.guildId!);

        await interaction.deferReply();
        
        if (!queue.current) {
            return interaction.editReply("Can't resume, I am not playing anything right now!");
        }
        
        if (!queue.connection.paused) {
            return interaction.editReply("The track is already playing");
        }
        queue.connection.resume();
        // queue.setPaused(false);
        return interaction.editReply("Resumed!");
    }

} as ISlashCommand;