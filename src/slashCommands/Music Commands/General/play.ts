import { ApplicationCommandOptionType, AutocompleteInteraction, CommandInteraction, GuildMember, TextChannel } from "discord.js";
import { getMember } from "../../../utils/djs";
import { IBot } from "../../../utils/interfaces/IBot";
import { ISlashCommand } from "../../../utils/interfaces/ISlashCommand";
import { basicSearch, createQueue, joinChannel, play, searchQuery } from "../../../utils/player";

module.exports = {
    name: "play",
    category: "Music Commands",
    description: "Plays a song from a url or a search query",
    botPermissions: ['SendMessages', 'EmbedLinks', 'Connect', 'Speak'],
    ignoreNotSameVoiceChannels: true,
    options: [
        {
            name: "search-query",
            description: "The url or search query to play.",
            type: ApplicationCommandOptionType.String,
            required: true,
            autocomplete: true,
        }
    ],

    execute: async (bot: IBot, interaction: CommandInteraction) => {
        if (!interaction.isChatInputCommand()) return;

        const guild = bot.client.guilds.cache.get(interaction.guildId!)!;
        const member: GuildMember = await getMember(guild, interaction.member?.user.id!);
        const channel = guild?.channels.cache.get(interaction.channelId!)! as TextChannel;
        const player = bot.player;

        if (!member.voice.channel) {
            return interaction.reply("You must be in a voice channel to play music.");
        }
        await interaction.deferReply();

        const queue = createQueue(guild, player, channel);
        const connected: boolean = queue.connection ? true : false;
        joinChannel(bot, connected, queue, member, interaction, player, guild, channel);

        const res = await searchQuery(connected, player, member, interaction, channel);
        if (!res || !res.tracks.length) return interaction.editReply({content: "No results found."});
        res.playlist ? queue.addTracks(res.tracks) : queue.addTrack(res.tracks[0]);
        
        play(queue, res, member, interaction);
    },

    autocomplete: async (bot: IBot, interaction: AutocompleteInteraction) => {
        if (!interaction.isAutocomplete()) return;
        const focusedValue = interaction.options.getFocused();
        const search = focusedValue;
        const choices: string[] = [];

        const guild = bot.client.guilds.cache.get(interaction.guildId!)!;
        const member: GuildMember = await getMember(guild, interaction.member?.user.id!);
        const res = await basicSearch(member, bot.player, search);
        res.tracks.slice(0, 6).forEach(track => choices.push(track.title));
        return await interaction.respond(choices.map((choice) => ({ name: choice, value: choice })));
    }
} as ISlashCommand;