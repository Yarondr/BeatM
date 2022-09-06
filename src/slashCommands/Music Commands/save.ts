import { ApplicationCommandOptionType, CommandInteraction, GuildMember, TextChannel } from "discord.js";
import { getMember } from "../../utils/djs";
import { IBot } from "../../utils/interfaces/IBot";
import { ISlashCommand } from "../../utils/interfaces/ISlashCommand";
import { createQueue } from "../../utils/player";

module.exports = {
    name: "save",
    category: "Music Commands",
    description: "Send the current song to your DMs.",
    botPermissions: ['SendMessages', 'EmbedLinks'],
    DJOnly: true,
    
    execute: async (bot: IBot, interaction: CommandInteraction) => {
        if (!interaction.isChatInputCommand()) return;
        
        const guild = bot.client.guilds.cache.get(interaction.guildId!)!;
        const member: GuildMember = await getMember(guild, interaction.member?.user.id!);
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

        const song = queue.current;
        const user = await getMember(guild, interaction.member?.user.id!);
        const send = await user.send(`You requested to save the song **${song.title}** to your DMs. Here you go!`);
        if (send) {
            await user.send(`<${song.url}>`);
        } else {
            return interaction.reply("I couldn't send the song to your DMs. Make sure you have them enabled!");
        }

        return interaction.reply(`I sent the song **${song.title}** to your DMs!`);
    }
} as ISlashCommand