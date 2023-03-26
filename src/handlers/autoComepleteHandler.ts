import { Interaction } from "discord.js";
import { IBot } from "../utils/interfaces/IBot";
import { ISlashCommand } from "../utils/interfaces/ISlashCommand";

export async function handleAutoComplete(interaction: Interaction, slashCommand: ISlashCommand | undefined, bot: IBot) {
    if (interaction.isAutocomplete()) {
        if (slashCommand?.autocomplete) {
            try {
                slashCommand.autocomplete(bot, interaction);
            } catch (error) {
                console.log(error);
            }
        }
        return;
    }
}