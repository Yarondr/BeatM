import { ApplicationCommandOptionType, CommandInteraction, EmbedBuilder, GuildMember } from "discord.js";
import { IBot } from "../../utils/interfaces/IBot";
import { ISlashCommand } from "../../utils/interfaces/ISlashCommand";

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
        const member: GuildMember = (await (guild?.members.fetch(interaction.member?.user.id!)))!;
        const player = bot.player;
        const queue = player.getQueue(interaction.guildId!);
        
        if (!member.voice.channel) {
            return interaction.reply("You must be in a voice channel to play music.");
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
        
        // start build embed message
        const current = queue.current;
        const nowPlaying = current ?
            ` [${current.title}](${current.url}) | \`[${current.duration}]\`\n(requested by: ${current.requestedBy.tag})` :
            `Nothing`
        const embed = new EmbedBuilder();
        embed.setColor("Random");
        embed.setTitle(`Queue for ${guild.name}`);
        embed.setURL(`https://discord.com`);
        embed.addFields({name: "**Now Playing:**", value: nowPlaying, inline: false});

        // add tracks to embed
        const tracks = queue.tracks.slice(page * 10, page * 10 + 10)
            .map((track, index) => {
                const value = `\`${index + 1}\`. [${track.title}](${track.url}) | \`[${track.duration}]\`\n(requested by: ${track.requestedBy.tag})`
                const title = index == 0 ? "Up Next:" : "\u200b";
                embed.addFields({name: title, value: value, inline: false});
            }).join('\n');
        embed.addFields({name: "\u200b", value: `**${queue.tracks.length} songs waiting in queue | ${convertMilisecondsToTime(queue.totalTime)} total length**`, inline: false});
        await interaction.editReply({embeds: [embed]});

    }

} as ISlashCommand;

function convertMilisecondsToTime(miliseconds: number) {
    const date = new Date(miliseconds);
    const hours = date.getUTCHours();
    const minutes = date.getUTCMinutes();
    const seconds = date.getUTCSeconds();
    return ((hours * 60) + minutes) + ":" + seconds;
}