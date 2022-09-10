import { Queue } from "discord-player";
import { CommandInteraction, GuildMember, TextChannel } from "discord.js";
import { getMember } from "../../../utils/djs";
import { IBot } from "../../../utils/interfaces/IBot";
import { IQueueMetadata } from "../../../utils/interfaces/IQueueMetadata";
import { ISlashCommand } from "../../../utils/interfaces/ISlashCommand";
import { createQueue, scheduleQueueLeave, setupOnQueueFinish } from "../../../utils/player";

module.exports = {
    name: "stop",
    category: "Music Commands",
    description: "Stops the player",
    botPermissions: ['SendMessages', 'EmbedLinks'],
    DJOnly: true,
    
    execute: async (bot: IBot, interaction: CommandInteraction) => {
        if (!interaction.isChatInputCommand()) return;
        
        const guild = bot.client.guilds.cache.get(interaction.guildId!)!;
        const member: GuildMember = await getMember(guild, interaction.member?.user.id!);
        const channel = guild?.channels.cache.get(interaction.channelId!)! as TextChannel;
        let queue: Queue<IQueueMetadata> = bot.player.getQueue(interaction.guildId!)!;

        await interaction.deferReply();
        
        if (!queue.current) {
            return interaction.editReply("Can't stop, I am not playing anything right now!");
        }

        queue.clear();
        queue.skip();
        const voiceChannel = queue.connection.channel;
        queue.stop();
        await scheduleQueueLeave(bot, queue, guild, channel, voiceChannel);
        queue = createQueue(guild, bot.player, channel);
        await queue.connect(member.voice.channel!);
        setupOnQueueFinish(bot, queue, guild, bot.player, channel, voiceChannel);
        return interaction.editReply("Stopped!");
    }
} as ISlashCommand