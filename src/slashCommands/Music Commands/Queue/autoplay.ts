import { CommandInteraction } from "discord.js";
import { IBot } from "../../../utils/interfaces/IBot";
import { ISlashCommand } from "../../../utils/interfaces/ISlashCommand";

module.exports = {
    name: "autoplay",
    category: "Music Commands",
    description: "Toggles autoplay",
    botPermissions: ['SendMessages', 'EmbedLinks'],
    DJOnly: true,
    
    execute: async (bot: IBot, interaction: CommandInteraction) => {
        if (!interaction.isChatInputCommand()) return;
        
        let player = bot.manager.get(interaction.guildId!)!;

        await interaction.deferReply();

        const autoplay = !await player.get("autoplay");
        await player.set("autoplay", autoplay);
        await interaction.editReply(`Autoplay is now ${autoplay ? "enabled" : "disabled"}`);
    }
} as ISlashCommand