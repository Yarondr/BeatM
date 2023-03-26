import { CommandInteraction, EmbedBuilder, SlashCommandBuilder } from "discord.js";
import { getMember } from "../../../utils/djs";
import { IBot } from "../../../utils/interfaces/IBot";
import { ISlashCommand } from "../../../utils/interfaces/ISlashCommand";
import { formatViews } from "../../../utils/numbers";
import { convertMilisecondsToTime } from "../../../utils/player";

module.exports = {
    data: new SlashCommandBuilder()
        .setName("save")
        .setDescription("Send the current song to your DMs.")
        .setDMPermission(false),
    category: "Music Commands",
    ephemeral: true,
    botPermissions: ['SendMessages', 'EmbedLinks'],
    
    execute: async (bot: IBot, interaction: CommandInteraction) => {
        if (!interaction.isChatInputCommand()) return;
        
        const guild = bot.client.guilds.cache.get(interaction.guildId!)!;
        let player = bot.manager.get(interaction.guildId!)!;
        
        const song = player.queue.current;
        if (!song) {
            return interaction.editReply("No music is being played!");
        }

        const user = await getMember(guild, interaction.member?.user.id!);
        const embed = new EmbedBuilder()
            .setColor("Random")
            .setTitle(`Song: ${song.originalTitle}`)
            .setURL(song.originalUri!)
            .addFields(
                {name: "Duration", value: convertMilisecondsToTime(song.duration!), inline: true},
                // {name: "Views", value: formatViews(song.views), inline: true},
                {name: "Song URL:", value: song.originalUri!},
            )
            .setThumbnail(song.thumbnail!)
            .setTimestamp();
        const send = await user.send({content: `You requested to save the song **${song.originalTitle}** to your DMs. Here you go!`, embeds: [embed]});
        if (send) {
            return interaction.editReply(`I sent the song **${song.originalTitle}** to your DMs!`);
        } else {
            return interaction.editReply("I couldn't send the song to your DMs. Make sure you have them enabled!");
        }
        
    }
} as ISlashCommand