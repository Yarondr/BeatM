import { CommandInteraction, GuildMember } from "discord.js";
import { getMember } from "../../utils/djs";
import { IBot } from "../../utils/interfaces/IBot";
import { IQueueMetadata } from "../../utils/interfaces/IQueueMetadata";
import { ISlashCommand } from "../../utils/interfaces/ISlashCommand";
import { checkSkippingPlayers } from "../../utils/player";

module.exports = {
    name: "skip",
    category: "Music Commands",
    description: "Vote to skip the current song",
    botPermissions: ['SendMessages', 'EmbedLinks'],

    execute: async (bot: IBot, interaction: CommandInteraction) => {
        if (!interaction.isChatInputCommand()) return;
        
        const guild = bot.client.guilds.cache.get(interaction.guildId!)!;
        const member: GuildMember = await getMember(guild, interaction.member?.user.id!);
        const queue = bot.player.getQueue(interaction.guildId!);

        await interaction.deferReply();
        
        if (!queue.current) {
            return interaction.editReply("Can't skip, I am not playing anything right now!");
        }

        const voiceMembers = Math.floor(member.voice.channel!.members.filter(m => !m.user.bot).size / 2);
        const metadata = queue.metadata as IQueueMetadata;
        const skipVotes = checkSkippingPlayers(metadata.skipVotes, member.voice.channel!);
        if (skipVotes.includes(member.id)) {
            return interaction.editReply("You already voted to skip this song.");
        }
        skipVotes.push(member.id);
        if (skipVotes.length >= voiceMembers) {
            const success = queue.skip();
            if (queue.connection.paused) {
                queue.connection.resume();
            }
            const reply = success ? "Skipped!" : "Something went wrong...";
            return interaction.editReply(reply);
        } else {
            return interaction.editReply(`${skipVotes.length}/${voiceMembers} votes to skip this song.`);
        }
        
    }

} as ISlashCommand