import { ApplicationCommandOptionType, AutocompleteInteraction, CommandInteraction, GuildMember, SlashCommandBuilder, TextChannel } from "discord.js";
import { getMember } from "../../../utils/djs";
import { playSearchAutocomplete } from "../../../utils/autocomplete";
import { IBot } from "../../../utils/interfaces/IBot";
import { ISlashCommand } from "../../../utils/interfaces/ISlashCommand";
import { joinChannel, play, searchQuery } from "../../../utils/player";

module.exports = {
    data: new SlashCommandBuilder()
        .setName("playnext")
        .setDescription("Plays a song from a url or a search query next in the queue")
        .setDMPermission(false)
        .addStringOption(option => option
            .setName("search-query")
            .setDescription("The url or search query to play")
            .setRequired(true)),
    category: "Music Commands",
    botPermissions: ['SendMessages', 'EmbedLinks', 'Connect', 'Speak'],
    DJOnly: true,

    execute: async (bot: IBot, interaction: CommandInteraction) => {
        if (!interaction.isChatInputCommand()) return;

        const guild = bot.client.guilds.cache.get(interaction.guildId!)!;
        const member: GuildMember = await getMember(guild, interaction.member?.user.id!);
        const channel = guild?.channels.cache.get(interaction.channelId!)! as TextChannel;
        const player = bot.manager.get(interaction.guildId!)!;

        if (!player.queue.current) {
            return interaction.editReply("Can't play next when there is no song playing.");
        }

        joinChannel(bot, member, interaction, player, guild, channel);
        
        const res = await searchQuery(bot.manager, member, interaction);
        if (!res || !res.tracks.length) return interaction.editReply({content: "No results found."});
        const newTracks = res.playlist ? res.tracks : [res.tracks[0]];
        player.queue.unshift(...newTracks);
        
        play(player, res, member, interaction);
    },

    autocomplete: async (bot: IBot, interaction: AutocompleteInteraction) => {
        return await playSearchAutocomplete(bot, interaction);
    }
} as ISlashCommand;