import { CommandInteraction, GuildMember, SlashCommandBuilder, TextChannel } from "discord.js";
import { getMember } from "../../../utils/djs";
import { IBot } from "../../../utils/interfaces/IBot";
import { ISlashCommand } from "../../../utils/interfaces/ISlashCommand";

module.exports = {
    data: new SlashCommandBuilder()
        .setName("stop")
        .setDescription("Stops the player")
        .setDMPermission(false),
    category: "Music Commands",
    botPermissions: ['SendMessages', 'EmbedLinks'],
    DJOnly: true,
    
    execute: async (bot: IBot, interaction: CommandInteraction) => {
        if (!interaction.isChatInputCommand()) return;
        
        const guild = bot.client.guilds.cache.get(interaction.guildId!)!;
        const member: GuildMember = await getMember(guild, interaction.member?.user.id!);
        const channel = guild?.channels.cache.get(interaction.channelId!)! as TextChannel;
        let player = bot.manager.get(interaction.guildId!)!;
        
        if (!player.queue.current) {
            return interaction.editReply("Can't stop, I am not playing anything right now!");
        }

        player.queue.clear()
        player.stop();
        return interaction.editReply("Stopped!");
    }
} as ISlashCommand