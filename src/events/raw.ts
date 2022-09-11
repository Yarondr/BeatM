import { IBot } from "../utils/interfaces/IBot";
import { IEvent } from "../utils/interfaces/IEvent";

module.exports = {
    name: "raw",
    once: false,
    execute: async (bot: IBot, data: any) => {
        bot.manager.updateVoiceState(data);
    }
} as IEvent