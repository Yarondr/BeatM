import { Track } from "@yarond/erela.js";
import { CommandInteraction } from "discord.js";
import { IBot } from "../../../utils/interfaces/IBot";
import { ISlashCommand } from "../../../utils/interfaces/ISlashCommand";

module.exports = {
    name: "unshuffle",
    category: "Music Commands",
    description: "Unshuffle the queue to the original order",
    botPermissions: ['SendMessages', 'EmbedLinks'],
    DJOnly: true,
    
    execute: async (bot: IBot, interaction: CommandInteraction) => {
        if (!interaction.isChatInputCommand()) return;
        
        const player = bot.manager.get(interaction.guildId!)!;

        await interaction.deferReply();

        const oldQueue = player.get("previousQueue") as Track[];
        if (!oldQueue) {
            return interaction.editReply("Can't unshuffle, queue is not shuffled!");
        }
        
        player.queue.clear();
        player.queue.add(oldQueue);
        await interaction.editReply(`The queue has been unshuffled and is now back to the original order!`);
    }
} as ISlashCommand