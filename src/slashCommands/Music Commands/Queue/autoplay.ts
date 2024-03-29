import { CommandInteraction, SlashCommandBuilder } from "discord.js";
import { IBot } from "../../../utils/interfaces/IBot";
import { ISlashCommand } from "../../../utils/interfaces/ISlashCommand";

module.exports = {
    data: new SlashCommandBuilder()
        .setName("autoplay")
        .setDescription("Toggles autoplay")
        .setDMPermission(false),
    category: "Music Commands",
    botPermissions: ['SendMessages', 'EmbedLinks'],
    DJOnly: true,
    
    execute: async (bot: IBot, interaction: CommandInteraction) => {
        if (!interaction.isChatInputCommand()) return;
        
        let player = bot.manager.get(interaction.guildId!)!;

        const autoplay = !await player.get("autoplay");
        await player.set("autoplay", autoplay);
        await interaction.editReply(`Autoplay is now ${autoplay ? "enabled" : "disabled"}`);
    }
} as ISlashCommand