import { PlayerSearchResult, Playlist, QueryType } from "discord-player";
import { ApplicationCommandOptionType, CommandInteraction, EmbedBuilder, GuildChannel, GuildMember, PermissionFlagsBits, TextChannel } from "discord.js";
import { getMember } from "../../utils/djs";
import { IBot } from "../../utils/interfaces/IBot";
import { IQueueMetadata } from "../../utils/interfaces/IQueueMetadata";
import { ISlashCommand } from "../../utils/interfaces/ISlashCommand";
import { convertMilisecondsToTime, isTrackLive, playlistLength } from "../../utils/player";

module.exports = {
    name: "play",
    category: "Music Commands",
    description: "Plays a song from a url or a search query",
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

        const { options } = interaction;
        const guild = bot.client.guilds.cache.get(interaction.guildId!)!;
        const member: GuildMember = await getMember(guild, interaction.member?.user.id!);
        const channel = guild?.channels.cache.get(interaction.channelId!)! as TextChannel;
        const search = options.get('search-query')?.value?.toString()!;
        const player = bot.player;


        if (!member.voice.channel) {
            return interaction.reply("You must be in a voice channel to play music.");
        }
        await interaction.deferReply();

        // create queue and join voice channel
        const queue = player.createQueue(guild, {
            metadata: {
                channel,
                skipVotes: [],
            } as IQueueMetadata
        });
        // create a connect var
        const connected: boolean = queue.connection ? true : false;
        try {
            if (!connected) {
                await queue.connect(member.voice.channel);
                await interaction.editReply(`Joined \`${member.voice.channel.name}\` And bound to <#${channel.id}>`);
            } else if (queue.connection.channel.id !== member.voice.channel.id) {
                return interaction.editReply(`Can't join to \`${member.voice.channel.name}\` because I'm already in another voice channel.`);
            }
        } catch {
            player.deleteQueue(guild.id);
            return interaction.editReply(`I can't join your voice channel. ${member.id}`);
        }

        // search and add tracks to queue
        if (!connected) await channel.send("Searching...");
        else await interaction.editReply("Searching...");
        const res = await player.search(search, {
            requestedBy: member,
            searchEngine: QueryType.AUTO
        });
        if (!res || !res.tracks.length) return interaction.editReply({content: "No results found."});
        res.playlist ? queue.addTracks(res.tracks) : queue.addTrack(res.tracks[0]);
        
        if (!queue.playing) {
            await queue.play();
            const embed = buildEmbed(res, `Playing "${res.tracks[0].title}"`, member);
            await queue.metadata!.channel.send({embeds: [embed]});
        } else {
            const title = res.playlist ? res.playlist.title : res.tracks[0].title;
            const embed = buildEmbed(res, `Added "${title}" to queue`, member);
            await interaction.editReply({embeds: [embed]});
        }
    }
} as ISlashCommand;

function buildEmbed(res: PlayerSearchResult, embedTitle: string, member: GuildMember) {
    const url = res.playlist ? res.playlist.url : res.tracks[0].url;
    let duration = res.playlist ? playlistLength(res.playlist) : convertMilisecondsToTime(res.tracks[0].durationMS);
    if (!res.playlist && isTrackLive(res.tracks[0])) duration = "LIVE";

    return new EmbedBuilder()
        .setColor("Random")
        .setTitle(embedTitle)
        // TODO: support spotify thumbnail
        .setThumbnail(res.tracks[0].thumbnail)
        .setURL(url)
        .addFields(
            {name: 'Requested By:', value: member.user.tag},
            {name: 'Duration:', value: duration}
        )
        .setTimestamp();
        // TODO: set footer with loop and queue loop status
}