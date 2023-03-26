import { ApplicationCommandOptionType, CommandInteraction, SlashCommandBuilder } from "discord.js";
import { IBot } from "../../../utils/interfaces/IBot";
import { ISlashCommand } from "../../../utils/interfaces/ISlashCommand";
import { isIntNumber } from "../../../utils/numbers";

module.exports = {
    data: new SlashCommandBuilder()
        .setName("volume")
        .setDescription("Sets the volume of the bot")
        .setDMPermission(false)
        .addStringOption(option => option
            .setName("volume")
            .setDescription("The volume to set the bot to")
            .setRequired(true)),
    category: "Music Commands",
    botPermissions: ['SendMessages', 'EmbedLinks'],
    DJOnly: true,
    
    execute: async (bot: IBot, interaction: CommandInteraction) => {
        if (!interaction.isChatInputCommand()) return;
        
        let player = bot.manager.get(interaction.guildId!)!;
        
        let volume: number | string = interaction.options.getString('volume')!;
        if (!isIntNumber(volume) && volume != "reset") {
            return interaction.editReply("The volume must be a number or \"reset\"!");
        }
        if (volume == "reset") {
            volume = 100;
        }
        volume = parseInt(volume.toString());
        if (volume < 1 || volume > 200) {
            return interaction.editReply("The volume must be between 1 and 200!");
        }
        const success = player.setVolume(volume);
        const reply = success ? `The volume has been set to ${volume}` : "Failed to set the volume";
        await interaction.editReply(reply);
    }
} as ISlashCommand