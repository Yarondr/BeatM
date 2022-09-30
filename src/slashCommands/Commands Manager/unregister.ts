import { ApplicationCommand, ApplicationCommandOptionType, CommandInteraction, SlashCommandBuilder } from "discord.js"
import { IBot } from "../../utils/interfaces/IBot";
import { ISlashCommand } from "../../utils/interfaces/ISlashCommand";

module.exports = {
    data: new SlashCommandBuilder()
        .setName("unregister")
        .setDescription("Unregister a command")
        .setDMPermission(false)
        .addStringOption(option => option
            .setName("command")
            .setDescription("The command name to unregister")
            .setRequired(true)),
    category: "Commands Manager",
    ownerOnly: true,
    permissions: ['Administrator'],
    botPermissions: ['SendMessages'],
    execute: async (bot: IBot, interaction: CommandInteraction) => {
        if (!interaction.isChatInputCommand()) return;
        
        const { options } = interaction;
        const { slashCommands } = bot;
        const command = options.getString('command')!;

        await interaction.deferReply({ ephemeral: true });

        try {
            if (!slashCommands.has(command)) {
                return interaction.editReply({content: "This command does not exist!"});
            } else {
                const cmd = slashCommands.get(command)!;
                const guild = interaction.guild;
                const guildCommands = await guild?.commands.fetch();
                const clientCommand: ApplicationCommand = guildCommands?.find(c => c.name === command)!;
                await guild?.commands.delete(clientCommand.id);
                slashCommands.delete(command);
                await interaction.editReply({content: `Command ${cmd.data.name} has been unregistered!`});
            }
        } catch (e) {
            console.error(e);
            return interaction.editReply("An error occurred while trying to unregister the command.");
        }
    }
} as ISlashCommand;