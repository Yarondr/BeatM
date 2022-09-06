import { PlayerSearchResult, Playlist, QueryType } from "discord-player";
import { ApplicationCommandOptionType, CommandInteraction, EmbedBuilder, GuildChannel, GuildMember, PermissionFlagsBits, TextChannel } from "discord.js";
import { getMember } from "../../utils/djs";
import { IBot } from "../../utils/interfaces/IBot";
import { IQueueMetadata } from "../../utils/interfaces/IQueueMetadata";
import { ISlashCommand } from "../../utils/interfaces/ISlashCommand";
import { buildPlayEmbed, convertMilisecondsToTime, createQueue, isTrackLive, joinChannel, play, playlistLength, searchQuery } from "../../utils/player";

module.exports = {
    name: "playnext",
    category: "Music Commands",
    description: "Plays a song from a url or a search query next in the queue",
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

        // create queue and join voice channel
        const queue = createQueue(guild, player, channel);
        // create a connect var
        const connected: boolean = queue.connection ? true : false;
        joinChannel(connected, queue, member, interaction, player, guild, channel);
        
        const res = await searchQuery(connected, player, member, interaction, channel);
        if (!res || !res.tracks.length) return interaction.editReply({content: "No results found."});
        const newTracks = res.playlist ? res.tracks : [res.tracks[0]];
        queue.tracks.unshift(...newTracks);
        
        play(queue, res, member, interaction);
    }
} as ISlashCommand;