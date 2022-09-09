import { Queue } from "discord-player";
import { ButtonInteraction } from "discord.js";
import { IBot } from "./IBot";
import { ICommandArgs } from "./ICommandArgs";
import { IQueueMetadata } from "./IQueueMetadata";

export interface IButton {
    execute: (bot: IBot, queue: Queue<IQueueMetadata>, interaction: ButtonInteraction, args: ICommandArgs) => Promise<any>;
}