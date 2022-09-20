import { CommandInteraction, GuildMember, TextChannel } from "discord.js";
import { getMember } from "../../../utils/djs";
import { IBot } from "../../../utils/interfaces/IBot";
import { ISlashCommand } from "../../../utils/interfaces/ISlashCommand";
import { createPlayer, joinChannel } from "../../../utils/player";

module.exports = {
    name: "join",
    category: "Music Commands",
    description: "Join to the user's voice channel",
    ignoreNotSameVoiceChannels: true,
    botPermissions: ['SendMessages', 'EmbedLinks', 'Connect', 'Speak'],
    
    execute: async (bot: IBot, interaction: CommandInteraction) => {
        if (!interaction.isChatInputCommand()) return;

        const guild = bot.client.guilds.cache.get(interaction.guildId!)!;
        const member: GuildMember = await getMember(guild, interaction.member?.user.id!);
        const channel = guild?.channels.cache.get(interaction.channelId!)! as TextChannel;
        const manager = bot.manager;


        if (!member.voice.channel) {
            return interaction.reply("You must be in a voice channel to play music.");
        }
        await interaction.deferReply();

        const player = await createPlayer(guild, manager, member.voice.channel, channel);
        await joinChannel(bot, member, interaction, player, guild, channel);
    }
} as ISlashCommand;