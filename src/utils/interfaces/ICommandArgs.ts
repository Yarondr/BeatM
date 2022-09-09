import { Guild, GuildMember, TextChannel } from "discord.js";

export interface ICommandArgs {
    guild: Guild,
    member: GuildMember,
    channel: TextChannel
}