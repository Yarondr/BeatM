import { ApplicationCommandOptionType, CommandInteraction, SlashCommandBuilder } from "discord.js";
import { IBot } from "../../../utils/interfaces/IBot";
import { ISlashCommand } from "../../../utils/interfaces/ISlashCommand";
import { convertMilisecondsToTime, isTrackLive, playerDurationToMiliseconds } from "../../../utils/player";

module.exports = {
    data: new SlashCommandBuilder()
        .setName("forward")
        .setDescription("Forwards the current song by a specified amount of time")
        .setDMPermission(false)
        .addNumberOption(option => option
            .setName("seconds")
            .setDescription("The amount of seconds to skip forward.")
            .setRequired(true)
            .setMinValue(1)),
    category: "Music Commands",
    botPermissions: ['SendMessages', 'EmbedLinks'],
    DJOnly: true,
    
    execute: async (bot: IBot, interaction: CommandInteraction) => {
        if (!interaction.isChatInputCommand()) return;
        
        const secondToSkip = interaction.options.getNumber('seconds')!;
        let player = bot.manager.get(interaction.guildId!)!;

        await interaction.deferReply();
        
        if (!player.queue.current) {
            return interaction.editReply("Can't skip forward, I am not playing anything right now!");
        }
        if (isTrackLive(player.queue.current)) {
            return interaction.editReply("Can't skip forward, because the current song is live!");
        }

        const currentTime = player.position;
        const newTime = currentTime + secondToSkip * 1000;
        if (newTime > player.queue.current.duration! && newTime < 0) {
            return interaction.editReply("Can't skip out of the song!")
        }
        player.seek(newTime);
        return interaction.editReply(`Skipped forward to: ${convertMilisecondsToTime(newTime)}.`);
    }
} as ISlashCommand