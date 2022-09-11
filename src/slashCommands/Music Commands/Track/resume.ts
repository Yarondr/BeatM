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
        
        const player = bot.manager.get(interaction.guildId!)!;

        await interaction.deferReply();
        
        if (!player.queue.current) {
            return interaction.editReply("Can't resume, I am not playing anything right now!");
        }
        
        if (!player.paused) {
            return interaction.editReply("The track is already playing");
        }
        player.pause(false);
        return interaction.editReply("Resumed!");
    }

} as ISlashCommand;