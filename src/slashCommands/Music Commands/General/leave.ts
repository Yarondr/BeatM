import { CommandInteraction, GuildMember, SlashCommandBuilder } from "discord.js";
import { getMember } from "../../../utils/djs";
import { IBot } from "../../../utils/interfaces/IBot";
import { ISlashCommand } from "../../../utils/interfaces/ISlashCommand";

module.exports = {
    data: new SlashCommandBuilder()
        .setName("leave")
        .setDescription("Leave the voice channel and clears the queue")
        .setDMPermission(false),
    category: "Music Commands",
    botPermissions: ['SendMessages', 'EmbedLinks'],
    
    execute: async (bot: IBot, interaction: CommandInteraction) => {
        if (!interaction.isChatInputCommand()) return;
        
        const guild = bot.client.guilds.cache.get(interaction.guildId!)!;
        const member: GuildMember = await getMember(guild, interaction.member?.user.id!);
        const player = bot.manager.get(interaction.guildId!)!;
        
        player.disconnect();
        await interaction.editReply(`Disconnected from \`${member.voice.channel!.name}\``);
    }
} as ISlashCommand