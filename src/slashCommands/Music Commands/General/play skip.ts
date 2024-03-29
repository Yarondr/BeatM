import { ApplicationCommandOptionType, AutocompleteInteraction, CommandInteraction, GuildMember, SlashCommandBuilder, TextChannel } from "discord.js";
import { getMember } from "../../../utils/djs";
import { playSearchAutocomplete } from "../../../utils/autocomplete";
import { IBot } from "../../../utils/interfaces/IBot";
import { ISlashCommand } from "../../../utils/interfaces/ISlashCommand";
import { joinChannel, play, searchQuery } from "../../../utils/player";

module.exports = {
    data: new SlashCommandBuilder()
        .setName("playskip")
        .setDescription("Skips the current song and plays a song from a url or a search query")
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
        
        await play(player, res, member, interaction);
        player.stop();
        if (player.paused) {
            player.pause(false);
        }
    },

    autocomplete: async (bot: IBot, interaction: AutocompleteInteraction) => {
        return await playSearchAutocomplete(bot, interaction);
    }
} as ISlashCommand;