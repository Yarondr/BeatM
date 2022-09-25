import { ActionRowBuilder, ButtonBuilder, ButtonStyle, CommandInteraction, EmbedBuilder, SlashCommandBuilder } from "discord.js";
import { IBot } from "../../../utils/interfaces/IBot";
import { ISlashCommand } from "../../../utils/interfaces/ISlashCommand";

module.exports = {
    data: new SlashCommandBuilder()
        .setName("controller")
        .setDescription("Send the music controller")
        .setDMPermission(false),
    category: "Music Commands",
    botPermissions: ['SendMessages', 'EmbedLinks'],
    
    execute: async (bot: IBot, interaction: CommandInteraction) => {
        if (!interaction.isChatInputCommand()) return;
        
        const guild = bot.client.guilds.cache.get(interaction.guildId!)!;

        await interaction.deferReply();

        const controllerEmbed = new EmbedBuilder()
            .setColor('Random')
            .setTitle("Music Controller")
            .setDescription("Click the buttons below to control the music!")
            .setImage(guild.iconURL({ size: 4096}))

        const pauseButton = new ButtonBuilder()
            .setEmoji("⏸️")
            .setStyle(ButtonStyle.Secondary)
            .setCustomId("pause")
        
        const resumeButton = new ButtonBuilder()
            .setEmoji("▶️")
            .setStyle(ButtonStyle.Secondary)
            .setCustomId("resume")
            
        const skipButton = new ButtonBuilder()
            .setEmoji("⏭️")
            .setStyle(ButtonStyle.Secondary)
            .setCustomId("skip")

        const stopButton = new ButtonBuilder()
            .setEmoji("⏹️")
            .setStyle(ButtonStyle.Secondary)
            .setCustomId("stop")

        const volumeUpButton = new ButtonBuilder()
            .setEmoji("🔊")
            .setStyle(ButtonStyle.Secondary)
            .setCustomId("volume up")

        const queueButton = new ButtonBuilder()
            .setEmoji("📜")
            .setStyle(ButtonStyle.Secondary)
            .setCustomId("queue")
        
        const volumeDownButton = new ButtonBuilder()
            .setEmoji("🔉")
            .setStyle(ButtonStyle.Secondary)
            .setCustomId("volume down")
        
        const loopButton = new ButtonBuilder()
            .setEmoji("🔂")
            .setStyle(ButtonStyle.Secondary)
            .setCustomId("loop")

        const queueLoopButton = new ButtonBuilder()
            .setEmoji("🔁")
            .setStyle(ButtonStyle.Secondary)
            .setCustomId("queue loop")

        const row1 = new ActionRowBuilder<ButtonBuilder>().addComponents(pauseButton, resumeButton, skipButton);
        const row2 = new ActionRowBuilder<ButtonBuilder>().addComponents(volumeDownButton, stopButton, volumeUpButton);
        const row3 = new ActionRowBuilder<ButtonBuilder>().addComponents(loopButton, queueLoopButton, queueButton);

        return await interaction.editReply({ embeds: [controllerEmbed], components: [row1, row2, row3] });
            
    }
} as ISlashCommand