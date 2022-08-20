import { CommandInteraction, GuildMember, TextChannel } from "discord.js";
import { getMember } from "../../utils/djs";
import { IBot } from "../../utils/interfaces/IBot";
import { IQueueMetadata } from "../../utils/interfaces/IQueueMetadata";
import { ISlashCommand } from "../../utils/interfaces/ISlashCommand";
import { createQueue } from "../../utils/player";

module.exports = {
    name: "join",
    category: "Music Commands",
    description: "Join to the user's voice channel",
    botPermissions: ['SendMessages', 'EmbedLinks', 'Connect', 'Speak'],
    
    execute: async (bot: IBot, interaction: CommandInteraction) => {
        if (!interaction.isChatInputCommand()) return;

        const guild = bot.client.guilds.cache.get(interaction.guildId!)!;
        const member: GuildMember = await getMember(guild, interaction.member?.user.id!);
        const channel = guild?.channels.cache.get(interaction.channelId!)! as TextChannel;
        const player = bot.player;


        if (!member.voice.channel) {
            return interaction.reply("You must be in a voice channel to play music.");
        }
        await interaction.deferReply();

        // create queue and join voice channel
        const queue = createQueue(guild, player, channel);
        try {
            if (!queue.connection) {
                await queue.connect(member.voice.channel);
                await interaction.editReply(`Joined \`${member.voice.channel.name}\` And bound to <#${channel.id}>`);
            } else {
                await interaction.editReply(`Can't join to \`${member.voice.channel.name}\` because I'm already in a voice channel.`);
            }
        } catch {
            player.deleteQueue(guild.id);
            return interaction.editReply(`I can't join your voice channel. ${member.id}`);
        }
    }
} as ISlashCommand;