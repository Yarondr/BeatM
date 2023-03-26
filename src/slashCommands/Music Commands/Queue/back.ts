import { CommandInteraction, SlashCommandBuilder } from "discord.js";
import { IBot } from "../../../utils/interfaces/IBot";
import { ISlashCommand } from "../../../utils/interfaces/ISlashCommand";

module.exports = {
    data: new SlashCommandBuilder()
        .setName("back")
        .setDescription("Go back to the previous track")
        .setDMPermission(false),
    category: "Music Commands",
    botPermissions: ['SendMessages', 'EmbedLinks'],
    DJOnly: true,
    
    execute: async (bot: IBot, interaction: CommandInteraction) => {
        if (!interaction.isChatInputCommand()) return;
        
        let player = bot.manager.get(interaction.guildId!)!;
        
        if (!player.queue.current) {
            return interaction.editReply("Can't go back, I am not playing anything right now!");
        }
        if (!player.queue.previous) {
            return interaction.editReply("Can't go back, There is no previous track!");
        }

        player.queue.unshift(player.queue.previous);
        player.stop(1);
        return interaction.editReply("Going back to previous track!");
    }
} as ISlashCommand