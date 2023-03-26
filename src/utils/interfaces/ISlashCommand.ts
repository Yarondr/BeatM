import { ApplicationCommandOptionData, AutocompleteInteraction, CommandInteraction, PermissionResolvable, SlashCommandBuilder } from "discord.js";
import { IBot } from "./IBot";

export interface ISlashCommand {
    originalName?: string;
    data: SlashCommandBuilder,
    category: string,
    subcategory?: string,
    ownerOnly?: boolean,
    DJOnly?: boolean,
    ephemeral?: boolean,
    ignoreNotSameVoiceChannels?: boolean,
    permissions?: PermissionResolvable[],
    botPermissions?: PermissionResolvable[],
    execute: (bot: IBot, interaction: CommandInteraction, ...args: any) => Promise<any>;
    autocomplete?: (bot: IBot, interaction: AutocompleteInteraction, ...args: any) => Promise<any>;
}