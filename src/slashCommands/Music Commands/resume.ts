import { CommandInteraction, GuildMember } from "discord.js";
import { getMember } from "../../utils/djs";
import { IBot } from "../../utils/interfaces/IBot";
import { ISlashCommand } from "../../utils/interfaces/ISlashCommand";

module.exports = {
    name: "resume",
    category: "Music Commands",
    description: "Resume the current track",
    botPermissions: ['SendMessages', 'EmbedLinks'],

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
        if (!queue.current) {
            return interaction.reply("Can't resume, I am not playing anything right now!");
        }
        
        if (!queue.connection.paused) {
            return interaction.reply("The track is already playing");
        }
        queue.connection.resume();
        // queue.setPaused(false);
        return interaction.reply("Resumed!");
    }

} as ISlashCommand;