import { ButtonInteraction, Message } from "discord.js";
import { Player } from '@yarond/erela.js';
import { IBot } from "./IBot";
import { ICommandArgs } from "./ICommandArgs";

export interface IButton {
    execute: (bot: IBot, player: Player, interaction: ButtonInteraction, args: ICommandArgs) => Promise<Message>;
}