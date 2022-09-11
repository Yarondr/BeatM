import { ActionRowBuilder, CommandInteraction, EmbedBuilder, SelectMenuBuilder } from "discord.js";
import { IBot } from "../../utils/interfaces/IBot";
import { ISlashCommand } from "../../utils/interfaces/ISlashCommand";

module.exports = {
    name: "help",
    category: "Other Commands",
    subcategory: "General",
    ignoreNotSameVoiceChannels: true,
    description: "Shows the help menu",
    botPermissions: ['SendMessages', 'EmbedLinks'],
    
    execute: async (bot: IBot, interaction: CommandInteraction) => {
        if (!interaction.isChatInputCommand()) return;

        await interaction.deferReply();

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
                        }
                    )
            );
        
        const embed = new EmbedBuilder()
            .setColor("Random")
            .setTitle("Help Menu")
            .setDescription("**Select a category from the following:**\n\n" +
                            "⚙️ **General**\n" +
                            "🎶 **Track\n**" +
                            "📃 **Queue**\n\n" +
                            "**Try these basic commands to get started:**\n" +
                            "`/play`**:** Enter a song name or link to play\n" +
                            "`/search`**:** Search for a song to play\n")
        
        return interaction.editReply({embeds: [embed], components: [selections]});
    }
} as ISlashCommand