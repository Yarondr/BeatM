import { CommandInteraction, SlashCommandBuilder } from "discord.js";
import { IBot } from "../../../utils/interfaces/IBot";
import { ISlashCommand } from "../../../utils/interfaces/ISlashCommand";

module.exports = {
    data: new SlashCommandBuilder()
        .setName("loop")
        .setDescription("The amount of seconds to skip backward")
        .setDMPermission(false),
    category: "Music Commands",
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