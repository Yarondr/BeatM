import { Player } from "@yarond/erela.js";
import { GuildMember, Interaction, Message, TextChannel } from "discord.js";
import { IBot } from "../utils/interfaces/IBot";
import { IButton } from "../utils/interfaces/IButton";
import { ICommandArgs } from "../utils/interfaces/ICommandArgs";
import { IDropdown } from "../utils/interfaces/IDropdown";
import { ISlashCommand } from "../utils/interfaces/ISlashCommand";
import { handleSlashCommand } from "./slashCommandsHandler";

export async function handleMessageComponent(interaction: Interaction, bot: IBot) {
    if (!interaction.inCachedGuild()) return;
    const { guild } = interaction;
    const channel = interaction.channel as TextChannel;
    const member: GuildMember = interaction.member;
    
    if (interaction.isButton()) {
        let customButtonId = interaction.customId;
        if (customButtonId.startsWith("volume")) customButtonId = "volume";
        else customButtonId = customButtonId.replaceAll(" ", "");
        
        const slashCommand: ISlashCommand | undefined = bot.slashCommands.get(customButtonId!);
        interaction.deferReply({ ephemeral: slashCommand?.ephemeral });

        // handle slash command for command checks only before execute the command
        await handleSlashCommand(interaction, slashCommand, bot, true).catch((err) => {
            console.log(err);
        });

        // execute button command
        try {
            const id = interaction.customId;
            const file: IButton | undefined = require(`../components/buttons/${id}.ts`);
            let player: Player = bot.manager.get(interaction.guildId!)!;
            if (file) {
                try {
                    const args: ICommandArgs = { guild: guild!, member: member, channel: channel }

                    const message: Message = await file.execute(bot, player, interaction, args).catch(async (err) => {
                        console.log(err);
                        return await interaction.fetchReply();
                    });

                    setTimeout(async () => {
                        await message.delete();
                    }, 5000);
                } catch (error) {
                    console.log(error);
                }
            }
        } catch (err) {
            return interaction.editReply("This button does not exist!");
        }

    } else if (interaction.isSelectMenu()) {
        await interaction.deferReply({ ephemeral: true });
        const selectedOption = interaction.values[0];
        try {
            const file: IDropdown | undefined = require(`../components/dropdowns/help/${selectedOption}.ts`);
            if (file) {
                try {
                    return await file.execute(bot, interaction).catch((err) => {
                        console.log(err);
                    });
                } catch (error) {
                    console.log(error);
                }
            }
        } catch (err) {
            return interaction.editReply("This dropdown does not exist!");
        }
    }

    
}