import { Queue } from "discord-player";
import { VoiceState } from "discord.js";
import { IBot } from "../utils/interfaces/IBot";
import { IEvent } from "../utils/interfaces/IEvent";
import { IQueueMetadata } from "../utils/interfaces/IQueueMetadata";
import { scheduleQueueLeave } from "../utils/player";

module.exports = {
    name: "voiceStateUpdate",
    once: false,
    execute: async (bot: IBot, oldState: VoiceState, newState: VoiceState) => {
        const queue = bot.manager.getQueue(newState.guild.id);
        if (!queue || !queue.connection) return;
        const voiceChannel = queue.connection.channel;
        if (voiceChannel.members.filter(m => !m.user.bot).size > 0) {
            if (bot.emptyChannelsWaitingToLeave.has(newState.guild.id)) {
                clearTimeout(bot.emptyChannelsWaitingToLeave.get(newState.guild.id));
                bot.emptyChannelsWaitingToLeave.delete(newState.guild.id);
            }
        } else {
            const textChannel = (queue.metadata as IQueueMetadata).channel;
            scheduleQueueLeave(bot, queue as Queue<IQueueMetadata>, queue.guild ,textChannel, oldState.channel!, true);
        }
    }
} as IEvent