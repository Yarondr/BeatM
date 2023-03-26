import { Track } from "@yarond/erela.js";
import { CommandInteraction, SlashCommandBuilder } from "discord.js";
import { IBot } from "../../../utils/interfaces/IBot";
import { ISlashCommand } from "../../../utils/interfaces/ISlashCommand";

module.exports = {
    data: new SlashCommandBuilder()
        .setName("unshuffle")
        .setDescription("Unshuffle the queue to the original order")
        .setDMPermission(false),
    category: "Music Commands",
    botPermissions: ['SendMessages', 'EmbedLinks'],
    DJOnly: true,
    
    execute: async (bot: IBot, interaction: CommandInteraction) => {
        if (!interaction.isChatInputCommand()) return;
        
        const player = bot.manager.get(interaction.guildId!)!;

        const oldQueue = player.get("previousQueue") as Track[];
        if (!oldQueue) {
            return interaction.editReply("Can't unshuffle, queue is not shuffled!");
        }
        
        player.queue.clear();
        player.queue.add(oldQueue);
        await interaction.editReply(`The queue has been unshuffled and is now back to the original order!`);
    }
} as ISlashCommand