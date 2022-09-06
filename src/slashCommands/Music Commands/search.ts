import { PlayerSearchResult, Playlist, QueryType } from "discord-player";
import { ApplicationCommandOptionType, CommandInteraction, EmbedBuilder, GuildChannel, GuildMember, PermissionFlagsBits, TextChannel } from "discord.js";
import { getMember } from "../../utils/djs";
import { IBot } from "../../utils/interfaces/IBot";
import { IQueueMetadata } from "../../utils/interfaces/IQueueMetadata";
import { ISlashCommand } from "../../utils/interfaces/ISlashCommand";
import { buildPlayEmbed, convertMilisecondsToTime, createQueue, isTrackLive, joinChannel, play, playlistLength, searchQuery } from "../../utils/player";

module.exports = {
    name: "search",
    category: "Music Commands",
    description: "Show the search results for a query and let you choose which one to play.",
    botPermissions: ['SendMessages', 'EmbedLinks', 'Connect', 'Speak'],
    options: [
        {
            name: "search-query",
            description: "The url or search query to play.",
            type: ApplicationCommandOptionType.String,
            required: true,
        }
    ],

    execute: async (bot: IBot, interaction: CommandInteraction) => {
        if (!interaction.isChatInputCommand()) return;

        const guild = bot.client.guilds.cache.get(interaction.guildId!)!;
        const member: GuildMember = await getMember(guild, interaction.member?.user.id!);
        const channel = guild?.channels.cache.get(interaction.channelId!)! as TextChannel;
        const search = interaction.options.getString('search-query')!;
        const player = bot.player;


        if (!member.voice.channel) {
            return interaction.reply("You must be in a voice channel to play music.");
        }
        await interaction.deferReply();

        const queue = createQueue(guild, player, channel);
        const connected: boolean = queue.connection ? true : false;
        
        const res = await searchQuery(connected, player, member, interaction, channel);
        if (!res || !res.tracks.length) return interaction.editReply({content: "No results found."});
        const maxTracks = res.tracks.slice(0, 10);

        const embed = new EmbedBuilder()
            .setColor("Random")
            .setTitle(`Search results for ${search}`)
            .setTimestamp();

        maxTracks.map((track, index) => {
                const duration = isTrackLive(track) ? "LIVE" : convertMilisecondsToTime(track.durationMS);
                const value = `\`${index + 1}.\` [${track.title}](${track.url}) | \`${duration}\``
                embed.addFields({name: "\u200b", value: value, inline: false});
        }); //.join('\n');

        const collector = channel.createMessageCollector({
            filter: (msg) => {
                return msg.author.id === member.id && msg.content.length >= 1 && msg.content.length <= 10;
            },
            time: 30000,
            max: 1
        });

        collector.on('collect', async (query) => {
            if (query.content.toLowerCase() === 'cancel') await interaction.editReply({content: "Cancelled."}) && collector.stop();

            const songNumber = parseInt(query.content);
            if (!songNumber || songNumber < 1 || songNumber > maxTracks.length) {
                await interaction.editReply({content: `Invalid song number. Please enter a number between 1 and ${maxTracks.length}, or cancel.`});
            }

            collector.stop();
            const connected: boolean = queue.connection ? true : false;
            joinChannel(connected, queue, member, interaction, player, guild, channel);
            await play(queue, res, member, interaction, songNumber - 1);
        });

        collector.on('end', async (collected, reason) => {
            if (reason === 'time') await interaction.editReply({content: "Search timed out."});
        });
    }
} as ISlashCommand;