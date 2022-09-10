import { Queue } from "discord-player";
import { CommandInteraction, GuildMember } from "discord.js";
import { getMember } from "../../../utils/djs";
import { IBot } from "../../../utils/interfaces/IBot";
import { IQueueMetadata } from "../../../utils/interfaces/IQueueMetadata";
import { ISlashCommand } from "../../../utils/interfaces/ISlashCommand";
import { skip } from "../../../utils/player";

module.exports = {
    name: "skip",
    category: "Music Commands",
    description: "Vote to skip the current song",
    botPermissions: ['SendMessages', 'EmbedLinks'],

    execute: async (bot: IBot, interaction: CommandInteraction) => {
        if (!interaction.isChatInputCommand()) return;
        
        const guild = bot.client.guilds.cache.get(interaction.guildId!)!;
        const member: GuildMember = await getMember(guild, interaction.member?.user.id!);
        const queue: Queue<IQueueMetadata> = bot.player.getQueue(interaction.guildId!);

        await interaction.deferReply();
        
        if (!queue.current) {
            return interaction.editReply("Can't skip, I am not playing anything right now!");
        }

        await skip(member, queue, interaction);
        
    }

} as ISlashCommand