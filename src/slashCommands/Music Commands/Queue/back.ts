import { CommandInteraction } from "discord.js";
import { IBot } from "../../../utils/interfaces/IBot";
import { ISlashCommand } from "../../../utils/interfaces/ISlashCommand";

module.exports = {
    name: "back",
    category: "Music Commands",
    description: "Go back to the previous track",
    botPermissions: ['SendMessages', 'EmbedLinks'],
    DJOnly: true,
    
    execute: async (bot: IBot, interaction: CommandInteraction) => {
        if (!interaction.isChatInputCommand()) return;
        
        let queue = bot.player.getQueue(interaction.guildId!);

        await interaction.deferReply();
        
        if (!queue.current) {
            return interaction.editReply("Can't go back, I am not playing anything right now!");
        }
        if (!queue.previousTracks[1]) {
            return interaction.editReply("Can't go back, There is no previous track!");
        }

        await queue.back();
        return interaction.editReply("Going back to previous track!");
    }
} as ISlashCommand