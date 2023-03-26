import { CommandInteraction, GuildMember, SlashCommandBuilder } from "discord.js";
import { getMember } from "../../../utils/djs";
import { IBot } from "../../../utils/interfaces/IBot";
import { ISlashCommand } from "../../../utils/interfaces/ISlashCommand";
import { skip } from "../../../utils/player";

module.exports = {
    data: new SlashCommandBuilder()
        .setName("skip")
        .setDescription("The url or search query to play")
        .setDMPermission(false),
    category: "Music Commands",
    botPermissions: ['SendMessages', 'EmbedLinks'],

    execute: async (bot: IBot, interaction: CommandInteraction) => {
        if (!interaction.isChatInputCommand()) return;
        
        const guild = bot.client.guilds.cache.get(interaction.guildId!)!;
        const member: GuildMember = await getMember(guild, interaction.member?.user.id!);
        const player = bot.manager.get(interaction.guildId!)!;
        
        if (!player.queue.current) {
            return interaction.editReply("Can't skip, I am not playing anything right now!");
        }

        await skip(member, player, interaction);
        
    }

} as ISlashCommand