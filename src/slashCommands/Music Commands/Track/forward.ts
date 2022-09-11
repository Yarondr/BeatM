import { ApplicationCommandOptionType, CommandInteraction } from "discord.js";
import { IBot } from "../../../utils/interfaces/IBot";
import { ISlashCommand } from "../../../utils/interfaces/ISlashCommand";
import { convertSecondsToTime, playerDurationToSeconds } from "../../../utils/player";

module.exports = {
    name: "forward",
    category: "Music Commands",
    description: "Forwards the current song by a specified amount of time",
    botPermissions: ['SendMessages', 'EmbedLinks'],
    DJOnly: true,
    options: [
        {
            name: "seconds",
            description: "The amount of seconds to skip forward.",
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
            return interaction.editReply("Can't skip forward, I am not playing anything right now!");
        }

        const currentTime = player.position;
        const newTime = currentTime + secondToSkip
        if (newTime > player.queue.current.duration! && newTime < 0) {
            return interaction.editReply("Can't skip out of the song!")
        }
        player.seek(newTime);
        return interaction.editReply(`Skipped forward to: ${convertSecondsToTime(newTime)}.`);
    }
} as ISlashCommand