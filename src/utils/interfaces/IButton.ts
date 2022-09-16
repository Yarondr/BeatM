import { ButtonInteraction, Message } from "discord.js";
import { Player } from 'erela.js/src';
import { IBot } from "./IBot";
import { ICommandArgs } from "./ICommandArgs";

export interface IButton {
    execute: (bot: IBot, player: Player, interaction: ButtonInteraction, args: ICommandArgs) => Promise<Message>;
}