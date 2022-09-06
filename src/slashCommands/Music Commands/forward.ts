import { ApplicationCommandOptionType, CommandInteraction, GuildMember, TextChannel } from "discord.js";
import { getMember } from "../../utils/djs";
import { IBot } from "../../utils/interfaces/IBot";
import { ISlashCommand } from "../../utils/interfaces/ISlashCommand";
import { createQueue, playerDurationToMiliseconds } from "../../utils/player";

module.exports = {
    name: "forward",
    category: "Music Commands",
    //TODO: let copilot put the desc
    description: "Skips forward",
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
        
        const guild = bot.client.guilds.cache.get(interaction.guildId!)!;
        const member: GuildMember = await getMember(guild, interaction.member?.user.id!);
        const secondToSkip = interaction.options.getInteger('seconds')!;
        let queue = bot.player.getQueue(interaction.guildId!);
        
        if (!member.voice.channel) {
            return interaction.reply("You must be in a voice channel to use this command!.");
        }
        if (!queue || !queue.connection) {
            return interaction.reply("I'm not in a voice channel!");
        }
        if (member.voice.channel.id != queue.connection.channel.id) {
            return interaction.reply("You must be in the same voice channel as the bot to use this command.");
        }
        if (!queue.current) {
            return interaction.reply("Can't skip forward, I am not playing anything right now!");
        }

        const timestamp = queue.getPlayerTimestamp();   
        console.log(timestamp);
        console.log(timestamp.current);
        console.log(timestamp.end);
        console.log(timestamp.progress);
        const currentTime = playerDurationToMiliseconds(timestamp.current);
        const timeToSkip = secondToSkip * 1000;
        const newTime = currentTime + timeToSkip
        if (newTime > playerDurationToMiliseconds(timestamp.end)) {
            return interaction.reply("Can't skip out of the song!")
        }
        await queue.seek(newTime);
        return interaction.reply(`Skipped forward to: ${newTime}.`);
    }
} as ISlashCommand