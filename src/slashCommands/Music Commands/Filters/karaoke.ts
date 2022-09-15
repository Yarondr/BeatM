import { CommandInteraction } from "discord.js";
import { IBot } from "../../../utils/interfaces/IBot";
import { ISlashCommand } from "../../../utils/interfaces/ISlashCommand";

module.exports = {
    name: "karaoke",
    category: "Music Commands",
    description: "Remove most of the vocals from the music",
    botPermissions: ['SendMessages', 'EmbedLinks'],

    execute: async (bot: IBot, interaction: CommandInteraction) => {
        if (!interaction.isChatInputCommand()) return;
        const player = bot.manager.get(interaction.guildId!)! as any;
        
        await interaction.deferReply();
                
        player.karaoke = true;
        
        return interaction.editReply(`Filter **${module.exports.name}** has been applied to the music!`);
    }

} as ISlashCommand;