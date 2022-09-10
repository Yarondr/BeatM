import { Message, SelectMenuInteraction } from "discord.js";
import { IBot } from "./IBot";

export interface IDropdown {
    execute: (bot: IBot, interaction: SelectMenuInteraction) => Promise<Message>;
}