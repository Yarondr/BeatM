import { ApplicationCommandOptionType, CommandInteraction, EmbedBuilder, GuildMember, SlashCommandBuilder, TextChannel } from "discord.js";
import { getMember } from "../../../utils/djs";
import { IBot } from "../../../utils/interfaces/IBot";
import { ISlashCommand } from "../../../utils/interfaces/ISlashCommand";
import { convertMilisecondsToTime, createPlayer, isTrackLive, joinChannel, play, searchQuery } from "../../../utils/player";

module.exports = {
    data: new SlashCommandBuilder()
        .setName("search")
        .setDescription("Show the search results for a query and let you choose which one to play")
        .setDMPermission(false)
        .addStringOption(option => option
            .setName("search-query")
            .setDescription("The url or search query to play")
            .setRequired(true)),
    category: "Music Commands",
    botPermissions: ['SendMessages', 'EmbedLinks', 'Connect', 'Speak'],
    ignoreNotSameVoiceChannels: true,

    execute: async (bot: IBot, interaction: CommandInteraction) => {
        if (!interaction.isChatInputCommand()) return;

        const guild = bot.client.guilds.cache.get(interaction.guildId!)!;
        const member: GuildMember = await getMember(guild, interaction.member?.user.id!);
        const channel = guild?.channels.cache.get(interaction.channelId!)! as TextChannel;
        const search = interaction.options.getString('search-query')!;


        if (!member.voice.channel) {
            return interaction.editReply("You must be in a voice channel to play music.");
        }

        const player = createPlayer(guild, bot.manager, member.voice.channel, channel);
        
        const res = await searchQuery(bot.manager, member, interaction);
        if (!res || !res.tracks.length) return interaction.editReply({content: "No results found."});
        const maxTracks = res.tracks.slice(0, 10);

        const embed = new EmbedBuilder()
            .setColor("Random")
            .setTitle(`Search results for ${search}`)
            .setTimestamp();

        maxTracks.map((track, index) => {
                const duration = isTrackLive(track) ? "LIVE" : convertMilisecondsToTime(track.duration);
                const value = `\`${index + 1}.\` [${track.originalTitle}](${track.originalUri}) | \`${duration}\``
                embed.addFields({name: "\u200b", value: value, inline: false});
        }); //.join('\n');

        await interaction.editReply({content: "Enter your choice (1-10) or type `cancel` to cancel the search.", embeds: [embed]});

        const collector = interaction.channel!.createMessageCollector({
            filter: (msg) => {
                return msg.author.id === member.id && msg.content.length >= 1 && msg.content.length <= 10;
            },
            time: 30000,
            max: 1
        });

        collector.on('collect', async (query) => {
            if (query.content.toLowerCase() == 'cancel') return await interaction.editReply({content: "Cancelled.", embeds: []}), collector.stop();
            if (isNaN(parseInt(query.content))) return await interaction.editReply({content: "Invalid number.", embeds: []}), collector.stop();

            const songNumber = parseInt(query.content);
            if (!songNumber || songNumber < 1 || songNumber > maxTracks.length) {
                return await interaction.editReply({content: `Invalid song number. Please enter a number between 1 and ${maxTracks.length}, or cancel.`}), collector.stop();
            }

            collector.stop();
            await joinChannel(bot, member, interaction, player, guild, channel);
            player.queue.add(res.tracks[songNumber - 1]);
            await play(player, res, member, interaction, songNumber - 1, true);
        });

        collector.on('end', async (collected, reason) => {
            if (reason == 'time') await interaction.editReply({content: "Search timed out."});
        });
    }
} as ISlashCommand;