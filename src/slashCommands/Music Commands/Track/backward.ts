import { ApplicationCommandOptionType, CommandInteraction } from "discord.js";
import { IBot } from "../../../utils/interfaces/IBot";
import { ISlashCommand } from "../../../utils/interfaces/ISlashCommand";
import { convertMilisecondsToTime, playerDurationToMiliseconds } from "../../../utils/player";

module.exports = {
    name: "backward",
    category: "Music Commands",
    description: "Go backward a specific amount of seconds",
    botPermissions: ['SendMessages', 'EmbedLinks'],
    DJOnly: true,
    options: [
        {
            name: "seconds",
            description: "The amount of seconds to skip backward.",
            type: ApplicationCommandOptionType.Integer,
            minValue: 1,
            required: true,
        }
    ],
    
    execute: async (bot: IBot, interaction: CommandInteraction) => {
        if (!interaction.isChatInputCommand()) return;
        
        const secondToSkip = interaction.options.getInteger('seconds')!;
        let player = bot.manager.get(interaction.guildId!)!;

        await interaction.deferReply();

        if (!player.queue.current) {
            return interaction.editReply("Can't skip backward, I am not playing anything right now!");
        }

        const currentTime = player.position;
        const newTime = currentTime - secondToSkip * 1000;
        if (newTime > player.queue.current.duration! && newTime < 0) {
            return interaction.editReply("Can't skip out of the song!")
        }
        player.seek(newTime);
        return interaction.editReply(`Skipped backward to: ${convertMilisecondsToTime(newTime)}.`);
    }
} as ISlashCommand