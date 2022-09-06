import { ApplicationCommandOptionType, CommandInteraction, GuildMember, TextChannel } from "discord.js";
import { getMember } from "../../utils/djs";
import { IBot } from "../../utils/interfaces/IBot";
import { ISlashCommand } from "../../utils/interfaces/ISlashCommand";
import { isValidDuration } from "../../utils/numbers";
import { convertMilisecondsToTime, createQueue, playerDurationToMiliseconds } from "../../utils/player";

module.exports = {
    name: "skipto",
    category: "Music Commands",
    //TODO: let copilot put the desc
    description: "Skips to a specific time in the song",
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
        
        const guild = bot.client.guilds.cache.get(interaction.guildId!)!;
        const member: GuildMember = await getMember(guild, interaction.member?.user.id!);
        const timeToSkip: string = interaction.options.getString('time')!;
        let queue = bot.player.getQueue(interaction.guildId!);

        await interaction.deferReply();
        
        if (!member.voice.channel) {
            return interaction.editReply("You must be in a voice channel to use this command!.");
        }
        if (!queue || !queue.connection) {
            return interaction.editReply("I'm not in a voice channel!");
        }
        if (member.voice.channel.id != queue.connection.channel.id) {
            return interaction.editReply("You must be in the same voice channel as the bot to use this command.");
        }
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