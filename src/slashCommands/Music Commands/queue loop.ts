import { QueueRepeatMode } from "discord-player";
import { CommandInteraction, GuildMember } from "discord.js";
import { getMember } from "../../utils/djs";
import { IBot } from "../../utils/interfaces/IBot";
import { ISlashCommand } from "../../utils/interfaces/ISlashCommand";

module.exports = {
    name: "queueloop",
    category: "Music Commands",
    description: "Loop the current queue",
    botPermissions: ['SendMessages', 'EmbedLinks'],
    DJOnly: true,
    
    execute: async (bot: IBot, interaction: CommandInteraction) => {
        if (!interaction.isChatInputCommand()) return;
        
        const guild = bot.client.guilds.cache.get(interaction.guildId!)!;
        const member: GuildMember = await getMember(guild, interaction.member?.user.id!);
        const queue = bot.player.getQueue(interaction.guildId!);

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
        if (!queue.current) {
            return interaction.editReply("Can't loop, I am not playing anything right now!");
        }
        if (queue.repeatMode != QueueRepeatMode.QUEUE) {
            queue.setRepeatMode(QueueRepeatMode.QUEUE);
            return interaction.editReply("Queue looped!");
        } else {
            queue.setRepeatMode(QueueRepeatMode.OFF);
            return interaction.editReply("Queue loop disabled!");
        }
    }
} as ISlashCommand