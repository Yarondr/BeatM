import { EmbedBuilder, GuildMember } from "discord.js";

export function embedContent(content: string, member: GuildMember) {
    return new EmbedBuilder()
        .setColor("Random")
        .setDescription(`${member.user} ${content}`)
}