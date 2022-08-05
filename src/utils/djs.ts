import { Guild, GuildMember } from "discord.js";

export async function getMember(guild: Guild, memberId: string) {
    let member: GuildMember | undefined = guild.members.cache.get(memberId);
    if (!member) member = await guild.members.fetch(memberId);
    return member;
}