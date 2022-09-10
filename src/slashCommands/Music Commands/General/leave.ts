import { CommandInteraction, GuildMember } from "discord.js";
import { getMember } from "../../../utils/djs";
import { IBot } from "../../../utils/interfaces/IBot";
import { ISlashCommand } from "../../../utils/interfaces/ISlashCommand";

module.exports = {
    name: "leave",
    category: "Music Commands",
    description: "Leave the voice channel and clears the queue",
    botPermissions: ['SendMessages', 'EmbedLinks'],
    
    execute: async (bot: IBot, interaction: CommandInteraction) => {
        if (!interaction.isChatInputCommand()) return;
        
        const guild = bot.client.guilds.cache.get(interaction.guildId!)!;
        const member: GuildMember = await getMember(guild, interaction.member?.user.id!);
        const queue = bot.player.getQueue(interaction.guildId!)!;

        await interaction.deferReply();
        
        queue.destroy(true)
        await interaction.editReply(`Disconnected from \`${member.voice.channel!.name}\``);
    }
} as ISlashCommand