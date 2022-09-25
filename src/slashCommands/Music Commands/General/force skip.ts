import { CommandInteraction, SlashCommandBuilder } from "discord.js";
import { IBot } from "../../../utils/interfaces/IBot";
import { ISlashCommand } from "../../../utils/interfaces/ISlashCommand";

module.exports = {
    data: new SlashCommandBuilder()
        .setName("forceskip")
        .setDescription("Force skip the current track")
        .setDMPermission(false),
    category: "Music Commands",
    botPermissions: ['SendMessages', 'EmbedLinks'],
    DJOnly: true,

    execute: async (bot: IBot, interaction: CommandInteraction) => {
        if (!interaction.isChatInputCommand()) return;
        
        const player = bot.manager.get(interaction.guildId!)!;

        await interaction.deferReply();
        
        if (!player.queue.current) {
            return interaction.editReply("Can't skip, I am not playing anything right now!");
        }

        player.stop();
        if (player.paused) {
            player.pause(false);
        }
        return interaction.editReply("Skipped!");
        
    }

} as ISlashCommand