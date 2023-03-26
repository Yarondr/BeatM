import { ApplicationCommandOptionType, CommandInteraction, SlashCommandBuilder } from "discord.js";
import { IBot } from "../../../utils/interfaces/IBot";
import { ISlashCommand } from "../../../utils/interfaces/ISlashCommand";
import { isValidDuration } from "../../../utils/numbers";
import { convertMilisecondsToTime, playerDurationToMiliseconds } from "../../../utils/player";

module.exports = {
    data: new SlashCommandBuilder()
        .setName("skipto")
        .setDescription("Skips to a specific time in the current track")
        .setDMPermission(false)
        .addStringOption(option => option
            .setName("time")
            .setDescription("The time of the song to skip to")
            .setRequired(true)),
    category: "Music Commands",
    botPermissions: ['SendMessages', 'EmbedLinks'],
    DJOnly: true,
    
    execute: async (bot: IBot, interaction: CommandInteraction) => {
        if (!interaction.isChatInputCommand()) return;
        
        const timeToSkip: string = interaction.options.getString('time')!;
        let player = bot.manager.get(interaction.guildId!)!;
        
        if (!player.queue.current) {
            return interaction.editReply("Can't skip to a specific time, I am not playing anything right now!");
        }
        if (!isValidDuration(timeToSkip)) {
            return interaction.editReply("Invalid duration!");
        }
   
        const newTime = playerDurationToMiliseconds(timeToSkip)
        if (newTime > player.queue.current.duration! || newTime < 0) {
            return interaction.editReply("Can't skip out of the song!")
        }
        player.seek(newTime);
        return interaction.editReply(`Skipped to: ${convertMilisecondsToTime(newTime)}.`);
    }
} as ISlashCommand