import { CommandInteraction } from "discord.js";
import { IBot } from "../../../utils/interfaces/IBot";
import { ISlashCommand } from "../../../utils/interfaces/ISlashCommand";

module.exports = {
    name: "shuffle",
    category: "Music Commands",
    description: "Shuffle the queue",
    botPermissions: ['SendMessages', 'EmbedLinks'],
    DJOnly: true,
    
    execute: async (bot: IBot, interaction: CommandInteraction) => {
        if (!interaction.isChatInputCommand()) return;
        
        const queue = bot.player.getQueue(interaction.guildId!)!;

        await interaction.deferReply();
        
        if (queue.tracks.length == 0) {
            return interaction.editReply("Can't shuffle, queue is empty!");
        }
        if (queue.tracks.length > 0) {
            for (let i = 0; i < queue.tracks.length; i++) {
                const random = Math.floor(Math.random() * queue.tracks.length);
                const temp = queue.tracks[i];
                queue.tracks[i] = queue.tracks[random];
                queue.tracks[random] = temp;
            }
            await interaction.editReply(`The queue of ${queue.tracks.length} songs has been shuffled!`);
        } else {
            await interaction.editReply(`Can't shuffle the queue because it's empty.`);
        }
    }
} as ISlashCommand