import { ApplicationCommandOptionType, CommandInteraction, GuildMember, TextChannel } from "discord.js";
import { getMember } from "../../utils/djs";
import { IBot } from "../../utils/interfaces/IBot";
import { ISlashCommand } from "../../utils/interfaces/ISlashCommand";
import { createQueue } from "../../utils/player";

module.exports = {
    name: "jumpto",
    category: "Music Commands",
    description: "Jump to a specific song in the queue.",
    botPermissions: ['SendMessages', 'EmbedLinks'],
    DJOnly: true,
    options: [
        {
            name: "song-number",
            description: "The number of the song to remove",
            type: ApplicationCommandOptionType.Integer,
            minValue: 1,
            required: true,
        }
    ],
    
    execute: async (bot: IBot, interaction: CommandInteraction) => {
        if (!interaction.isChatInputCommand()) return;
        
        const guild = bot.client.guilds.cache.get(interaction.guildId!)!;
        const member: GuildMember = await getMember(guild, interaction.member?.user.id!);
        const songIndex = interaction.options.getInteger('song-number')! -1;
        let queue = bot.player.getQueue(interaction.guildId!);

        await interaction.deferReply();
        
        if (!member.voice.channel) {
            return interaction.editReply("You must be in a voice channel to use this command!.");
        }
        if (!queue || !queue.connection) {
            return interaction.editReply("I'm not in a voice channel!");
        }
        if (member.voice.channel.id != queue.connection.channel.id) {
            return interaction.editReply("You must be in the same voice channel as the bot to use this command.");
        }
        if (queue.tracks.length === 0) {
            return interaction.editReply("Can't jump to a song when there are no songs in the queue!");
        }
        if (songIndex >= queue.tracks.length) {
            return interaction.editReply("Invalid song number!");
        }

        queue.skipTo(songIndex);
        return interaction.editReply(`Jumped to song number ${songIndex + 1}!`);
    }
} as ISlashCommand