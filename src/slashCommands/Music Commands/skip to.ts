import { ApplicationCommandOptionType, CommandInteraction } from "discord.js";
import { IBot } from "../../utils/interfaces/IBot";
import { ISlashCommand } from "../../utils/interfaces/ISlashCommand";
import { isValidDuration } from "../../utils/numbers";
import { convertMilisecondsToTime, playerDurationToMiliseconds } from "../../utils/player";

module.exports = {
    name: "skipto",
    category: "Music Commands",
    description: "Skips to a specific time in the current track",
    botPermissions: ['SendMessages', 'EmbedLinks'],
    DJOnly: true,
    options: [
        {
            name: "time",
            description: "The time of the song to skip to",
            type: ApplicationCommandOptionType.String,
            minValue: 1,
            required: true,
        }
    ],
    
    execute: async (bot: IBot, interaction: CommandInteraction) => {
        if (!interaction.isChatInputCommand()) return;
        
        const timeToSkip: string = interaction.options.getString('time')!;
        let queue = bot.player.getQueue(interaction.guildId!);

        await interaction.deferReply();
        
        if (!queue.current) {
            return interaction.editReply("Can't skip to a specific time, I am not playing anything right now!");
        }
        if (!isValidDuration(timeToSkip)) {
            return interaction.editReply("Invalid duration!");
        }

        const timestamp = queue.getPlayerTimestamp();   
        const newTime = playerDurationToMiliseconds(timeToSkip)
        if (newTime > playerDurationToMiliseconds(timestamp.end) || newTime < 0) {
            return interaction.editReply("Can't skip out of the song!")
        }
        await queue.seek(newTime);
        return interaction.editReply(`Skipped to: ${convertMilisecondsToTime(newTime)}.`);
    }
} as ISlashCommand