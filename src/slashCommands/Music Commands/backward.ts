import { ApplicationCommandOptionType, CommandInteraction } from "discord.js";
import { IBot } from "../../utils/interfaces/IBot";
import { ISlashCommand } from "../../utils/interfaces/ISlashCommand";
import { convertMilisecondsToTime, playerDurationToMiliseconds } from "../../utils/player";

module.exports = {
    name: "backward",
    category: "Music Commands",
    description: "Go backward a specific amount of seconds",
    botPermissions: ['SendMessages', 'EmbedLinks'],
    DJOnly: true,
    options: [
        {
            name: "seconds",
            description: "The amount of seconds to skip backwards.",
            type: ApplicationCommandOptionType.Integer,
            minValue: 1,
            required: true,
        }
    ],
    
    execute: async (bot: IBot, interaction: CommandInteraction) => {
        if (!interaction.isChatInputCommand()) return;
        
        const secondToSkip = interaction.options.getInteger('seconds')!;
        let queue = bot.player.getQueue(interaction.guildId!);

        await interaction.deferReply();

        if (!queue.current) {
            return interaction.editReply("Can't skip backwards, I am not playing anything right now!");
        }

        const timestamp = queue.getPlayerTimestamp();   
        const currentTime = playerDurationToMiliseconds(timestamp.current);
        const timeToSkip = secondToSkip * 1000;
        const newTime = currentTime - timeToSkip
        if (newTime > playerDurationToMiliseconds(timestamp.end)) {
            return interaction.editReply("Can't skip out of the song!")
        }
        await queue.seek(newTime);
        return interaction.editReply(`Skipped backwards to: ${convertMilisecondsToTime(newTime)}.`);
    }
} as ISlashCommand