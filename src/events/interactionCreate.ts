import { CacheType, GuildMember, Interaction, InteractionType, Message, TextChannel } from "discord.js";
import { Player } from '@yarond/erela.js';
import { IBot } from "../utils/interfaces/IBot";
import { IButton } from "../utils/interfaces/IButton";
import { ICommandArgs } from "../utils/interfaces/ICommandArgs";
import { IDropdown } from "../utils/interfaces/IDropdown";
import { IEvent } from "../utils/interfaces/IEvent";
import { ISlashCommand } from "../utils/interfaces/ISlashCommand";
import { isDJ } from "../utils/player";
import { handleSlashCommand } from "../handlers/slashCommandsHandler";
import { handleMessageComponent } from "../handlers/componentHandler";
import { handleAutoComplete } from "../handlers/autoComepleteHandler";

module.exports = {
    name: "interactionCreate",
    once: false,
    execute: async (bot: IBot, interaction: Interaction<CacheType>, ...args: any) => {
        if (!interaction.inCachedGuild()) return;
        const { slashCommands } = bot;

        if (!interaction.isCommand() && !interaction.isAutocomplete() && interaction.type != InteractionType.MessageComponent && !interaction.isSelectMenu()) return;
        if (!interaction.inGuild()) return;
            
        let slashCommand: ISlashCommand | undefined = interaction.type != InteractionType.MessageComponent
                                                    ? slashCommands.get(interaction.commandName)
                                                    : undefined;
        
        switch (interaction.type) {
            case InteractionType.MessageComponent:
                // ------------------ Button / Menu ------------------
                await handleMessageComponent(interaction, bot).catch((err) => {
                    console.log(err);
                });
                break;
            case InteractionType.ApplicationCommand:
                // ------------------ Slash Command ------------------
                await handleSlashCommand(interaction, slashCommand, bot).catch((err) => {
                    console.log(err);
                });
                break;
            case InteractionType.ApplicationCommandAutocomplete:
                // ------------------ Auto Complete ------------------
                await handleAutoComplete(interaction, slashCommand, bot).catch((err) => {
                    console.log(err);
                });
                break;
        }
    }
} as IEvent