import { CommandInteraction, GuildMember, TextChannel } from "discord.js";
import { getMember } from "../../../utils/djs";
import { IBot } from "../../../utils/interfaces/IBot";
import { ISlashCommand } from "../../../utils/interfaces/ISlashCommand";

module.exports = {
    name: "stop",
    category: "Music Commands",
    description: "Stops the player",
    botPermissions: ['SendMessages', 'EmbedLinks'],
    DJOnly: true,
    
    execute: async (bot: IBot, interaction: CommandInteraction) => {
        if (!interaction.isChatInputCommand()) return;
        
        const guild = bot.client.guilds.cache.get(interaction.guildId!)!;
        const member: GuildMember = await getMember(guild, interaction.member?.user.id!);
        const channel = guild?.channels.cache.get(interaction.channelId!)! as TextChannel;
        let player = bot.manager.get(interaction.guildId!)!;

        await interaction.deferReply();
        
        if (!player.queue.current) {
            return interaction.editReply("Can't stop, I am not playing anything right now!");
        }

        player.queue.clear()
        player.stop();
        // player.destroy();
        // TODO: 
        // const voiceChannel = player.get("voiceChannel") as VoiceBasedChannel;
        // await scheduleQueueLeave(bot, player, guild, channel, voiceChannel);
        // player = createPlayer(guild, bot.manager, voiceChannel, channel);
        // player.connect();
        // setupOnQueueFinish(bot, player, guild, bot.manager, channel, voiceChannel);
        return interaction.editReply("Stopped!");
    }
} as ISlashCommand