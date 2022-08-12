import { CommandInteraction, EmbedBuilder, GuildMember } from "discord.js";
import { getMember } from "../../utils/djs";
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
        const guild = bot.client.guilds.cache.get(interaction.guildId!)!;
        const member: GuildMember = await getMember(guild, interaction.member?.user.id!);
        const queue = bot.player.getQueue(interaction.guildId!);

        if (!member.voice.channel) {
            return interaction.reply("You must be in a voice channel to play music.");
        }
        if (!queue || !queue.connection) {
            return interaction.reply("I'm not in a voice channel!");
        }
        if (member.voice.channel.id != queue.connection.channel.id) {
            return interaction.reply("You must be in the same voice channel as the bot to use this command.");
        }
        if (!queue.playing) {
            return interaction.reply("I am not playing anything right now!");
        }
        await interaction.deferReply();

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