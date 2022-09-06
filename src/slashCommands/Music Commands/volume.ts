import { ApplicationCommandOptionType, CommandInteraction, GuildMember, TextChannel } from "discord.js";
import { getMember } from "../../utils/djs";
import { IBot } from "../../utils/interfaces/IBot";
import { ISlashCommand } from "../../utils/interfaces/ISlashCommand";
import { isIntNumber } from "../../utils/numbers";

module.exports = {
    name: "volume",
    category: "Music Commands",
    description: "Sets the volume of the bot",
    botPermissions: ['SendMessages', 'EmbedLinks'],
    DJOnly: true,
    options: [
        {
            name: "volume",
            description: "The volume to set the bot to",
            minValue: 1,
            type: ApplicationCommandOptionType.String,
            required: true,
        }
    ],
    
    execute: async (bot: IBot, interaction: CommandInteraction) => {
        if (!interaction.isChatInputCommand()) return;
        
        const guild = bot.client.guilds.cache.get(interaction.guildId!)!;
        const member: GuildMember = await getMember(guild, interaction.member?.user.id!);
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

        let volume: number | string = interaction.options.getString('volume')!;
        if (!isIntNumber(volume) && volume != "reset") {
            return interaction.editReply("The volume must be a number or \"reset\"!");
        }
        if (volume == "reset") {
            volume = 100;
        }
        volume = parseInt(volume.toString());
        if (volume < 1 || volume > 200) {
            return interaction.editReply("The volume must be between 1 and 200!");
        }
        const success = queue.setVolume(volume);
        const reply = success ? `The volume has been set to ${volume}` : "Failed to set the volume";
        await interaction.editReply(reply);
    }
} as ISlashCommand