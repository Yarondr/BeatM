import { CommandInteraction } from "discord.js";
import { IBot } from "../../utils/interfaces/IBot";
import { ISlashCommand } from "../../utils/interfaces/ISlashCommand";

module.exports = {
    name: "forceskip",
    category: "Music Commands",
    description: "Force skip the current track",
    botPermissions: ['SendMessages', 'EmbedLinks'],
    DJOnly: true,

    execute: async (bot: IBot, interaction: CommandInteraction) => {
        if (!interaction.isChatInputCommand()) return;
        
        const queue = bot.player.getQueue(interaction.guildId!);

        await interaction.deferReply();
        
        if (!queue.current) {
            return interaction.editReply("Can't skip, I am not playing anything right now!");
        }

        const success = queue.skip();
        if (queue.connection.paused) {
            queue.connection.resume();
        }
        const reply = success ? "Skipped!" : "Something went wrong...";
        return interaction.editReply(reply);
        
    }

} as ISlashCommand