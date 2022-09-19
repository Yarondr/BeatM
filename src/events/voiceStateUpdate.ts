import { VoiceBasedChannel, VoiceState } from "discord.js";
import { IBot } from "../utils/interfaces/IBot";
import { IEvent } from "../utils/interfaces/IEvent";
import { scheduleQueueLeave } from "../utils/player";

module.exports = {
    name: "voiceStateUpdate",
    once: false,
    execute: async (bot: IBot, oldState: VoiceState, newState: VoiceState) => {
        const player = bot.manager.get(newState.guild.id)!;
        if (!player || player.state != "CONNECTED") return;
        const voiceChannel = await player.get("voiceChannel") as VoiceBasedChannel;
        if (voiceChannel.members.filter(m => !m.user.bot).size > 0) {
            if (bot.emptyChannelsWaitingToLeave.has(newState.guild.id)) {
                clearTimeout(bot.emptyChannelsWaitingToLeave.get(newState.guild.id));
                bot.emptyChannelsWaitingToLeave.delete(newState.guild.id);
            }
        } else {
            await scheduleQueueLeave(bot, player, true);
        }
    }
} as IEvent