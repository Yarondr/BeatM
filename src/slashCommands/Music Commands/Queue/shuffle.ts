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
        
        const player = bot.manager.get(interaction.guildId!)!;
        const queue = player.queue;

        await interaction.deferReply();
        
        if (queue.length == 0) {
            return interaction.editReply("Can't shuffle, queue is empty!");
        }
        for (let i = 0; i < queue.length; i++) {
            const random = Math.floor(Math.random() * queue.length);
            const temp = queue[i];
            queue[i] = queue[random];
            queue[random] = temp;
        }
        player.set("previousQueue", queue.map(track => track));
        await interaction.editReply(`The queue of ${queue.length} songs has been shuffled!`);
    }
} as ISlashCommand