import { CommandInteraction, EmbedBuilder, GuildMember, SlashCommandBuilder } from "discord.js";
import { IBot } from "../../../utils/interfaces/IBot";
import { ISlashCommand } from "../../../utils/interfaces/ISlashCommand";
import { convertMilisecondsToTime } from "../../../utils/player";
import { createProgressBar } from "../../../utils/playingBar";

module.exports = {
    data: new SlashCommandBuilder()
        .setName("nowplaying")
        .setDescription("Displays the currently playing song")
        .setDMPermission(false),
    category: "Music Commands",
    botPermissions: ['SendMessages', 'EmbedLinks'],

    execute: async (bot: IBot, interaction: CommandInteraction) => {
        if (!interaction.isChatInputCommand()) return;
        
        const player = bot.manager.get(interaction.guildId!)!;
        const queue = player.queue;

        await interaction.deferReply();

        if (!queue.current) {
            return interaction.editReply("I am not playing anything right now!");
        }

        const loopMethods = ['disabled', 'Track', 'Queue'];
        const loopMethod = player.trackRepeat ? loopMethods[1] : player.queueRepeat ? loopMethods[2] : loopMethods[0];
        const track = queue.current;
        const duration = convertMilisecondsToTime(queue.current?.duration!)
        let progressBar = createProgressBar(player);
        if (duration == "LIVE") progressBar = progressBar.slice(0, -4) + "LIVE";

        const embed = new EmbedBuilder()
            .setColor("Random")
            .setThumbnail(track.thumbnail!)
            .setURL(track.originalUri!)
            .setTitle(`Now Playing: "${track.originalTitle}"`)
            .addFields(
                { name: "\u200b\nProgress:", value: progressBar, inline: false },
                { name : "\u200b", value: "\u200b", inline: false },
                { name: "Requested by:", value: track.requester! as string, inline: true },
                { name: "Volume:", value: `${player.volume}%`, inline: true },
                { name: "Loop:", value: loopMethod + "\n\u200b", inline: true },
            )
            .setTimestamp();
        
        // TODO: Add buttons to control volume and loop mode and pause/play
        await interaction.editReply({ embeds: [embed] });
    }
} as ISlashCommand;