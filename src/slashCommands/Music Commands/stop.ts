import { CommandInteraction, GuildMember, TextChannel } from "discord.js";
import { getMember } from "../../utils/djs";
import { IBot } from "../../utils/interfaces/IBot";
import { ISlashCommand } from "../../utils/interfaces/ISlashCommand";
import { createQueue } from "../../utils/player";

module.exports = {
    name: "stop",
    category: "Music Commands",
    description: "Stops the player",
    botPermissions: ['SendMessages', 'EmbedLinks'],
    DJOnly: true,
    
    execute: async (bot: IBot, interaction: CommandInteraction) => {
        if (!interaction.isChatInputCommand()) return;
        
        const guild = bot.client.guilds.cache.get(interaction.guildId!)!;
        const member: GuildMember = await getMember(guild, interaction.member?.user.id!);
        const channel = guild?.channels.cache.get(interaction.channelId!)! as TextChannel;
        let queue = bot.player.getQueue(interaction.guildId!);

        await interaction.deferReply();
        
        if (!queue.current) {
            return interaction.editReply("Can't stop, I am not playing anything right now!");
        }

        queue.stop();
        queue = createQueue(guild, bot.player, channel);
        await queue.connect(member.voice.channel!);
        return interaction.editReply("Stopped!");
    }
} as ISlashCommand