import { CacheType, Client, Guild, GuildMember, Interaction, TextChannel } from "discord.js"
import { IBot } from "../utils/interfaces/IBot"
import { IEvent } from "../utils/interfaces/IEvent"
import { ISlashCommand } from "../utils/interfaces/ISlashCommand";
import { isDJ } from "../utils/player";

module.exports = {
    name: "interactionCreate",
    once: false,
    execute: async (bot: IBot, interaction: Interaction<CacheType>, ...args: any) => {
        const { slashCommands, owners, client } = bot;
        const { guild } = interaction;
        const channel = interaction.channel as TextChannel;
        const member = interaction.member as GuildMember;
        if (!interaction.isCommand() && !interaction.isAutocomplete()) return;
        if (!interaction.inGuild()) return;
            
        const slashCommand: ISlashCommand | undefined = slashCommands.get(interaction.commandName);

        if (interaction.isAutocomplete()) {
            if (slashCommand?.autocomplete) {
                slashCommand.autocomplete(bot, interaction);
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
        
        await slashCommand.execute(bot, interaction)
    }
} as IEvent