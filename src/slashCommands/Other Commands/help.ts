import { ActionRowBuilder, CommandInteraction, EmbedBuilder, SelectMenuBuilder, SlashCommandBuilder } from "discord.js";
import { IBot } from "../../utils/interfaces/IBot";
import { ISlashCommand } from "../../utils/interfaces/ISlashCommand";

module.exports = {
    data: new SlashCommandBuilder()
        .setName("help")
        .setDescription("Shows the help menu")
        .setDMPermission(false),
    category: "Other Commands",
    subcategory: "General",
    ignoreNotSameVoiceChannels: true,
    botPermissions: ['SendMessages', 'EmbedLinks'],
    
    execute: async (bot: IBot, interaction: CommandInteraction) => {
        if (!interaction.isChatInputCommand()) return;

        const selections = new ActionRowBuilder<SelectMenuBuilder>()
            .addComponents(
                new SelectMenuBuilder()
                    .setCustomId("help")
                    .setPlaceholder("Select a category")
                    .addOptions(
                        {
                            label: "General",
                            description: "General commands",
                            value: "general",
                            emoji: "⚙️"
                        },
                        {
                            label: "Track",
                            description: "Controls the current playing track",
                            value: "track",  
                            emoji: "🎶"
                        },
                        {

                            label: "Queue",
                            description: "Controls the queue",
                            value: "queue",
                            emoji: "📃"
                        },
                        {
                            label: "Filters",
                            description: "Controls the audio filters",
                            value: "filters",
                            emoji: "🎼"
                        }
                    )
            );
        
        const embed = new EmbedBuilder()
            .setColor("Random")
            .setTitle("Help Menu")
            .setDescription("**Select a category from the following:**\n\n" +
                            "⚙️ **General**\n" +
                            "🎶 **Track\n**" +
                            "📃 **Queue**\n" +
                            "🎼 **Filters**\n\n" +
                            "**Try these basic commands to get started:**\n" +
                            "`/play`**:** Enter a song name or link to play\n" +
                            "`/search`**:** Search for a song to play\n")
        
        return interaction.editReply({embeds: [embed], components: [selections]});
    }
} as ISlashCommand