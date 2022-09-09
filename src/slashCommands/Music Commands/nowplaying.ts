import { CommandInteraction, EmbedBuilder } from "discord.js";
import { IBot } from "../../utils/interfaces/IBot";
import { ISlashCommand } from "../../utils/interfaces/ISlashCommand";
import { convertMilisecondsToTime } from "../../utils/player";

module.exports = {
    name: "nowplaying",
    category: "Music Commands",
    description: "Displays the current playing song",
    botPermissions: ['SendMessages', 'EmbedLinks'],

    execute: async (bot: IBot, interaction: CommandInteraction) => {
        if (!interaction.isChatInputCommand()) return;
        
        const queue = bot.player.getQueue(interaction.guildId!);

        await interaction.deferReply();

        if (!queue.playing) {
            return interaction.editReply("I am not playing anything right now!");
        }

        const loopMethods = ['Off', 'Track', 'Queue'];
        const track = queue.current;
        const duration = convertMilisecondsToTime(queue.current.durationMS);
        let progressBar = queue.createProgressBar();
        if (duration == "LIVE") progressBar = progressBar.slice(0, -4) + "LIVE";

        const embed = new EmbedBuilder()
            .setColor("Random")
            .setThumbnail(track.thumbnail)
            .setURL(track.url)
            .setTitle(`Now Playing: "${track.title}"`)
            .addFields(
                { name: "\u200b\nProgress:", value: progressBar, inline: false },
                { name : "\u200b", value: "\u200b", inline: false },
                { name: "Requested by:", value: track.requestedBy.tag, inline: true },
                { name: "Volume:", value: `${queue.volume}%`, inline: true },
                { name: "Loop:", value: loopMethods[queue.repeatMode] + "\n\u200b", inline: true },
            )
            .setTimestamp();
        
        // TODO: Add buttons to control volume and loop mode and pause/play
        await interaction.editReply({ embeds: [embed] });
    }
} as ISlashCommand;