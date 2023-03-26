import { CommandInteraction, SlashCommandBuilder } from "discord.js";
import { IBot } from "../../../utils/interfaces/IBot";
import { ISlashCommand } from "../../../utils/interfaces/ISlashCommand";

module.exports = {
    data: new SlashCommandBuilder()
        .setName("pause")
        .setDescription("Pause the current track")
        .setDMPermission(false),
    category: "Music Commands",
    botPermissions: ['SendMessages', 'EmbedLinks'],

    execute: async (bot: IBot, interaction: CommandInteraction) => {
        if (!interaction.isChatInputCommand()) return;
        
        const player = bot.manager.get(interaction.guildId!)!;
        
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