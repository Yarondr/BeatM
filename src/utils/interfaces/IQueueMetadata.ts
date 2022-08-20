import { TextChannel } from "discord.js";

export interface IQueueMetadata {
    channel: TextChannel,
    skipVotes: string[],
}