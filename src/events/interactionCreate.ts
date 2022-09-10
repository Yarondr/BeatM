import { Queue } from "discord-player";
import { CacheType, Client, Guild, GuildMember, Interaction, InteractionType, Message, TextChannel } from "discord.js"
import { getMember } from "../utils/djs";
import { IBot } from "../utils/interfaces/IBot"
import { IButton } from "../utils/interfaces/IButton";
import { ICommandArgs } from "../utils/interfaces/ICommandArgs";
import { IDropdown } from "../utils/interfaces/IDropdown";
import { IEvent } from "../utils/interfaces/IEvent"
import { IQueueMetadata } from "../utils/interfaces/IQueueMetadata";
import { ISlashCommand } from "../utils/interfaces/ISlashCommand";
import { isDJ } from "../utils/player";

module.exports = {
    name: "interactionCreate",
    once: false,
    execute: async (bot: IBot, interaction: Interaction<CacheType>, ...args: any) => {
        if (!interaction.inCachedGuild()) return;
        const { slashCommands, owners, client } = bot;
        const { guild } = interaction;
        const channel = interaction.channel as TextChannel;
        const member: GuildMember = interaction.member;

        if (!interaction.isCommand() && !interaction.isAutocomplete() && interaction.type != InteractionType.MessageComponent && !interaction.isSelectMenu()) return;
        if (!interaction.inGuild()) return;

            
        let slashCommand: ISlashCommand | undefined;
        let customButtonId: string | undefined;

        if (interaction.type == InteractionType.MessageComponent) {
            if (interaction.isButton()) {
                customButtonId = interaction.customId;
                if (customButtonId.startsWith("volume")) customButtonId = "volume";
                else customButtonId = customButtonId.replaceAll(" ", "");
            } else if (interaction.isSelectMenu()) {
                const selectedOption = interaction.values[0];
                try {
                    const file: IDropdown | undefined = require(`../components/dropdowns/help/${selectedOption}.ts`);
                    if (file) {
                        try {
                            await interaction.deferReply({ ephemeral: true });

                            return await file.execute(bot, interaction);
                        } catch (error) {
                            console.log(error);
                        }
                    }
                } catch (err) {
                    return interaction.reply("This dropdown does not exist!");
                }
            }
        }

        interaction.type == InteractionType.MessageComponent
            ? slashCommand = slashCommands.get(customButtonId!)
            : slashCommand = slashCommands.get(interaction.commandName);


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
    
        if (!slashCommand) return interaction.reply("This command does not exist!");

        if (slashCommand.devOnly && !owners.includes(member.id)) {
            return interaction.reply("This command is only for developers!");
        }

        if (slashCommand.DJOnly && !isDJ(member)) {
            return interaction.reply("This command is only for DJs!");
        }
        
        if (slashCommand.permissions && !channel.permissionsFor(member).has(slashCommand.permissions)) {
            const missingPerms = channel.permissionsFor(member).missing(slashCommand.permissions!)
            return interaction.reply(`You don't have permission to use this command!\nMissing permissions: ${missingPerms?.join(', ')}`);
        }
        
        if (slashCommand.botPermissions && !channel?.permissionsFor(client.user!)?.has(slashCommand.botPermissions)) {
            const missingPerms = channel?.permissionsFor(client.user!)?.missing(slashCommand.botPermissions)
            return interaction.reply(`I don't have the required permissions to use this command!\nMissing permissions: ${missingPerms?.join(', ')}`);
        }

        if (!slashCommand.ignoreNotSameVoiceChannels && slashCommand.category == "Music Commands") {
            let queue = bot.player.getQueue(interaction.guildId!);
            if (!member.voice.channel) {
                return interaction.reply("You must be in a voice channel to use this command!.");
            }
            if (!queue || !queue.connection) {
                return interaction.reply("I'm not in a voice channel!");
            }
            if (member.voice.channel.id != queue.connection.channel.id) {
                return interaction.reply("You must be in the same voice channel as the bot to use this command.");
            }
        }

        if (interaction.type == InteractionType.MessageComponent) {
            if (interaction.isButton()) {
                const id = interaction.customId;
                try {
                    const file: IButton | undefined = require(`../components/buttons/${id}.ts`);
                    let queue: Queue<IQueueMetadata> = bot.player.getQueue(interaction.guildId!);
                    if (file) {
                        try {
                            await interaction.deferReply();

                            const args: ICommandArgs = {
                                guild: guild!,
                                member: member,
                                channel: channel
                            }
                            const message: Message = await file.execute(bot, queue, interaction, args);
                            setTimeout(async () => {
                                await message.delete();
                            }, 5000);
                        } catch (error) {
                            console.log(error);
                        }
                    }
                } catch (err) {
                    return interaction.reply("This button does not exist!");
                }
            }
        } else {
            try {
                await slashCommand.execute(bot, interaction);
            } catch (e) {
                console.error(e);
            }
        }

        
    }
} as IEvent