import { CommandInteraction } from "discord.js";
import { IBot } from "../../../utils/interfaces/IBot";
import { ISlashCommand } from "../../../utils/interfaces/ISlashCommand";

module.exports = {
    name: "replay",
    category: "Music Commands",
    description: "Add the current song to the start of the queue",
    botPermissions: ['SendMessages', 'EmbedLinks', 'Connect', 'Speak'],

    execute: async (bot: IBot, interaction: CommandInteraction) => {
        if (!interaction.isChatInputCommand()) return;

        const player = bot.manager.get(interaction.guildId!)!;

        if (!player.queue.current) {
            return interaction.editReply("Can't replay, I am not playing anything right now!");
        }
        await interaction.deferReply();

        player.seek(0);
        return interaction.editReply(`Replayed: \`${player.queue.current.title}\``);
    }
} as ISlashCommand;