import { ApplicationCommandOptionType, AutocompleteInteraction, CommandInteraction, GuildMember, Message, SlashCommandBuilder, TextChannel } from "discord.js";
import { getMember } from "../../../utils/djs";
import { playSearchAutocomplete } from "../../../utils/autocomplete";
import { IBot } from "../../../utils/interfaces/IBot";
import { ISlashCommand } from "../../../utils/interfaces/ISlashCommand";
import { basicSearch, createPlayer, joinChannel, play, searchQuery } from "../../../utils/player";
import { isURL } from "../../../utils/url";

module.exports = {
    data: new SlashCommandBuilder()
        .setName("play")
        .setDescription("Plays a song from a url or a search query")
        .setDMPermission(false)
        .addStringOption(option => option
            .setName("search-query")
            .setDescription("The url or search query to play")
            .setRequired(true)
            .setAutocomplete(true)),
    category: "Music Commands",
    botPermissions: ['SendMessages', 'EmbedLinks', 'Connect', 'Speak'],
    ignoreNotSameVoiceChannels: true,

    execute: async (bot: IBot, interaction: CommandInteraction) => {
        if (!interaction.isChatInputCommand()) return;

        const guild = bot.client.guilds.cache.get(interaction.guildId!)!;
        const member: GuildMember = await getMember(guild, interaction.member?.user.id!);
        const channel = guild?.channels.cache.get(interaction.channelId!)! as TextChannel;
        const manager = bot.manager;

        if (!member.voice.channel) {
            return interaction.editReply("You must be in a voice channel to play music.");
        }

        const player = createPlayer(guild, manager, member.voice.channel, channel);
        const message: Message | undefined = await joinChannel(bot, member, interaction, player, guild, channel);
        if (message) return;

        const res = await searchQuery(bot.manager, member, interaction);
        if (!res || res.loadType === "NO_MATCHES") return interaction.editReply({content: "No results found."});
        if (res?.loadType === "LOAD_FAILED") return interaction.editReply({ content: "Failed to load"});
        
        res.playlist ? player.queue.add(res.tracks) : player.queue.add(res.tracks[0]);
        
        play(player, res, member, interaction);
    },

    autocomplete: async (bot: IBot, interaction: AutocompleteInteraction) => {
        return await playSearchAutocomplete(bot, interaction);
    }
} as ISlashCommand;