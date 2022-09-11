import { ApplicationCommandOptionType, AutocompleteInteraction, CommandInteraction, GuildMember, TextChannel } from "discord.js";
import { getMember } from "../../../utils/djs";
import { IBot } from "../../../utils/interfaces/IBot";
import { ISlashCommand } from "../../../utils/interfaces/ISlashCommand";
import { basicSearch, createPlayer, joinChannel, play, searchQuery } from "../../../utils/player";
import { isURL } from "../../../utils/url";

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
        const manager = bot.manager;

        if (!member.voice.channel) {
            return interaction.reply("You must be in a voice channel to play music.");
        }
        await interaction.deferReply();

        const player = createPlayer(guild, manager, member.voice.channel, channel);
        joinChannel(bot, member, interaction, player, guild, channel);

        const res = await searchQuery(bot.manager, member, interaction);
        if (!res || res.loadType === "NO_MATCHES") return interaction.editReply({content: "No results found."});
        if (res?.loadType === "LOAD_FAILED") return interaction.editReply({ content: "Failed to load"});
        
        res.playlist ? player.queue.add(res.tracks) : player.queue.add(res.tracks[0]);
        
        play(player, res, member, interaction);
    },

    autocomplete: async (bot: IBot, interaction: AutocompleteInteraction) => {
        if (!interaction.isAutocomplete()) return;
        const focusedValue = interaction.options.getFocused();
        const search = focusedValue;
        if (isURL(search)) return await interaction.respond([{name: search, value: search}]);
        const choices: string[] = [];

        const guild = bot.client.guilds.cache.get(interaction.guildId!)!;
        const member: GuildMember = await getMember(guild, interaction.member?.user.id!);
        const res = await basicSearch(member, bot.manager, search);
        res.tracks.slice(0, 6).forEach(track => choices.push(track.title));
        return await interaction.respond(choices.map((choice) => ({ name: choice, value: choice })));
    }
} as ISlashCommand;