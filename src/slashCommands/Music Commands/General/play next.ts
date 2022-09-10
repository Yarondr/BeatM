import { Queue } from "discord-player";
import { ApplicationCommandOptionType, CommandInteraction, GuildMember, TextChannel } from "discord.js";
import { getMember } from "../../../utils/djs";
import { IBot } from "../../../utils/interfaces/IBot";
import { IQueueMetadata } from "../../../utils/interfaces/IQueueMetadata";
import { ISlashCommand } from "../../../utils/interfaces/ISlashCommand";
import { createQueue, joinChannel, play, searchQuery } from "../../../utils/player";

module.exports = {
    name: "playnext",
    category: "Music Commands",
    description: "Plays a song from a url or a search query next in the queue",
    botPermissions: ['SendMessages', 'EmbedLinks', 'Connect', 'Speak'],
    DJOnly: true,
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
        const player = bot.player;
        const queue: Queue<IQueueMetadata> = player.getQueue(interaction.guildId!)!;

        if (!queue.current) {
            return interaction.reply("Can't add to queue, nothing is playing.");
        }
        await interaction.deferReply();

        const connected: boolean = queue.connection ? true : false;
        joinChannel(bot, connected, queue, member, interaction, player, guild, channel);
        
        const res = await searchQuery(connected, player, member, interaction, channel);
        if (!res || !res.tracks.length) return interaction.editReply({content: "No results found."});
        const newTracks = res.playlist ? res.tracks : [res.tracks[0]];
        queue.tracks.unshift(...newTracks);
        
        play(queue, res, member, interaction);
    }
} as ISlashCommand;