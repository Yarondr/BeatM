import { ApplicationCommandOptionType, CommandInteraction, EmbedBuilder, GuildMember } from "discord.js";
import { getMember } from "../../utils/djs";
import { IBot } from "../../utils/interfaces/IBot";
import { ISlashCommand } from "../../utils/interfaces/ISlashCommand";
import { convertMilisecondsToTime } from "../../utils/player";

module.exports = {
    name: "queue",
    category: "Music Commands",
    description: "Show the current queue",
    botPermissions: ["SendMessages", 'EmbedLinks'],
    options: [
        {
            name: "page",
            description: "The page number to show",
            type: ApplicationCommandOptionType.Number,
            required: false,
            minValue: 1,
        }
    ],

    execute: async (bot: IBot, interaction: CommandInteraction) => {
        if (!interaction.isChatInputCommand()) return;
        const guild = bot.client.guilds.cache.get(interaction.guildId!)!;
        const member: GuildMember = await getMember(guild, interaction.member?.user.id!);
        const queue = bot.player.getQueue(interaction.guildId!);
        
        if (!member.voice.channel) {
            return interaction.reply("You must be in a voice channel to play music.");
        }
        if (!queue || !queue.connection) {
            return interaction.reply("I'm not in a voice channel!");
        }
        if (member.voice.channel.id != queue.connection.channel.id) {
            return interaction.reply("You must be in the same voice channel as the bot to use this command.");
        }
        if (!queue) {
            return interaction.reply("The queue is empty!\nUse the /play command to add a song to the queue.");
        }
        await interaction.deferReply();

        // check for pages
        const totalPages = Math.ceil(queue.tracks.length / 10) || 1;
        const page = (interaction.options.get('page')?.value || 1) as number -1;
        if (page + 1 > totalPages) {
            return await interaction.editReply(`Invalid Page. There are only a total of ${totalPages} pages.`);
        }
        
        
        const current = queue.current;
        const space = queue.tracks.length > 0 ? "\n\u200b" : "";
        const nowPlaying = current ?
            ` [${current.title}](${current.url}) | \`${convertMilisecondsToTime(current.durationMS)} Requested by: ${current.requestedBy.tag}\`` :
            `Nothing`
        
        // build the embed message
        const embed = new EmbedBuilder();
        embed.setColor("Random");
        embed.setTitle(`Queue for ${guild.name}`);
        embed.setURL(`https://discord.com`);
        embed.addFields({name: "Now Playing:", value: nowPlaying + space, inline: false});

        // add tracks to embed
        queue.tracks.slice(page * 10, page * 10 + 10)
            .map((track, index) => {
                const value = `\`${index + 1}.\` [${track.title}](${track.url}) | \`${convertMilisecondsToTime(track.durationMS)} Requested by: ${track.requestedBy.tag}\``
                const title = index == 0 ? "Up Next:" : "\u200b";
                embed.addFields({name: title, value: value, inline: false});
            }).join('\n');
        const songsText = queue.tracks.length > 1 ? "songs" : "song";
        embed.addFields({name: "\u200b", value: `**${queue.tracks.length} ${songsText} waiting in queue | ${convertMilisecondsToTime(queue.totalTime)} total length**`, inline: false});
        embed.setTimestamp();
        await interaction.editReply({embeds: [embed]});

        // TODO: set footer to page number with loop and queue loop

    }

} as ISlashCommand;