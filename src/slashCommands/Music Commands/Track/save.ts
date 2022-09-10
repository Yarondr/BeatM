import { CommandInteraction, EmbedBuilder } from "discord.js";
import { getMember } from "../../../utils/djs";
import { IBot } from "../../../utils/interfaces/IBot";
import { ISlashCommand } from "../../../utils/interfaces/ISlashCommand";
import { formatViews } from "../../../utils/numbers";
import { convertMilisecondsToTime } from "../../../utils/player";

module.exports = {
    name: "save",
    category: "Music Commands",
    description: "Send the current song to your DMs.",
    botPermissions: ['SendMessages', 'EmbedLinks'],
    
    execute: async (bot: IBot, interaction: CommandInteraction) => {
        if (!interaction.isChatInputCommand()) return;
        
        const guild = bot.client.guilds.cache.get(interaction.guildId!)!;
        let queue = bot.player.getQueue(interaction.guildId!);

        await interaction.deferReply();
        
        if (!queue || !queue.playing) {
            return interaction.editReply("No music is being played!");
        }

        const song = queue.current;
        const user = await getMember(guild, interaction.member?.user.id!);
        const embed = new EmbedBuilder()
            .setColor("Random")
            .setTitle(`Song: ${song.title}`)
            .setURL(song.url)
            .addFields(
                {name: "Duration", value: convertMilisecondsToTime(song.durationMS), inline: true},
                {name: "Views", value: formatViews(song.views), inline: true},
                {name: "Song URL:", value: song.url},
            )
            .setThumbnail(song.thumbnail)
            .setTimestamp();
        const send = await user.send({content: `You requested to save the song **${song.title}** to your DMs. Here you go!`, embeds: [embed]});
        if (send) {
            return interaction.editReply(`I sent the song **${song.title}** to your DMs!`);
        } else {
            return interaction.editReply("I couldn't send the song to your DMs. Make sure you have them enabled!");
        }
        
    }
} as ISlashCommand