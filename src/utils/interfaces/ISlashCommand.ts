import { ApplicationCommandOptionData, AutocompleteInteraction, CommandInteraction, PermissionResolvable } from "discord.js";
import { IBot } from "./IBot";

export interface ISlashCommand {
    name: string,
    category: string,
    description: string,
    devOnly?: boolean,
    DJOnly?: boolean,
    ignoreNotSameVoiceChannels?: boolean,
    permissions?: PermissionResolvable[],
    botPermissions?: PermissionResolvable[],
    options: ApplicationCommandOptionData[],
    execute: (bot: IBot, interaction: CommandInteraction, ...args: any) => Promise<any>;
    autocomplete?: (bot: IBot, interaction: AutocompleteInteraction, ...args: any) => Promise<any>;
}