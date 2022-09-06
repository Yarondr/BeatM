import { ApplicationCommandOptionType, CommandInteraction, GuildMember, TextChannel } from "discord.js";
import { getMember } from "../../utils/djs";
import { IBot } from "../../utils/interfaces/IBot";
import { ISlashCommand } from "../../utils/interfaces/ISlashCommand";
import { createQueue } from "../../utils/player";

module.exports = {
    name: "move",
    category: "Music Commands",
    description: "Move a specific song in the queue to a different position.",
    botPermissions: ['SendMessages', 'EmbedLinks'],
    DJOnly: true,
    options: [
        {
            name: "song-number",
            description: "The number of the song to move",
            type: ApplicationCommandOptionType.Integer,
            minValue: 1,
            required: true,
        },
        {
            name: "new-song-number",
            description: "The new position of the song",
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
        const newSongIndex = interaction.options.getInteger('new-song-number')! -1;
        let queue = bot.player.getQueue(interaction.guildId!);
        
        if (!member.voice.channel) {
            return interaction.reply("You must be in a voice channel to use this command!.");
        }
        if (!queue || !queue.connection) {
            return interaction.reply("I'm not in a voice channel!");
        }
        if (member.voice.channel.id != queue.connection.channel.id) {
            return interaction.reply("You must be in the same voice channel as the bot to use this command.");
        }
        if (queue.tracks.length === 0) {
            return interaction.reply("Can't remove a song from the queue, because the queue is empty!");
        }
        if (songIndex >= queue.tracks.length) {
            return interaction.reply("Invalid song number!");
        }
        if (newSongIndex >= queue.tracks.length) {
            return interaction.reply("Invalid new song number!");
        }

        const song = queue.tracks[songIndex];
        queue.tracks.splice(songIndex, 1);
        queue.tracks.splice(newSongIndex, 0, song);
        return interaction.reply(`Moved song to position ${newSongIndex + 1}!`);
    }
} as ISlashCommand