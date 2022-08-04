import { QueryType } from "discord-player";
import { ApplicationCommandOptionType, CommandInteraction, EmbedBuilder, GuildChannel, GuildMember, PermissionFlagsBits, TextChannel } from "discord.js";
import { IBot } from "../../utils/interfaces/IBot";
import { ISlashCommand } from "../../utils/interfaces/ISlashCommand";

module.exports = {
    name: "play",
    category: "Music Commands",
    description: "Plays a song from a url or a search query.",
    botPermissions: ['SendMessages', 'EmbedLinks', 'Connect', 'Speak'],
    options: [
        {
            name: "search-query",
            description: "The url or search query to play.",
            type: ApplicationCommandOptionType.String,
            required: true,
        }
    ],

    execute: async (bot: IBot, interaction: CommandInteraction) => {
        if (!interaction.isChatInputCommand()) return;

        const { options } = interaction;
        const guild = bot.client.guilds.cache.get(interaction.guildId!)!;
        const member: GuildMember = (await (guild?.members.fetch(interaction.member?.user.id!)))!;
        const channel = guild?.channels.cache.get(interaction.channelId!)! as TextChannel;
        const search = options.get('search-query')?.value?.toString()!;
        const player = bot.player;


        if (!member.voice.channel) {
            return interaction.reply("You must be in a voice channel to play music.");
        }
        await interaction.deferReply();

        const res = await player.search(search, {
            requestedBy: member,
            searchEngine: QueryType.AUTO
        });

        if (!res || !res.tracks.length) return interaction.editReply({content: "No results found."});

        const queue = player.createQueue(guild, {
            metadata: channel
        });

        try {
            if (!queue.connection) await queue.connect(member.voice.channel);
        } catch {
            player.deleteQueue(guild.id);
            return interaction.editReply(`I can't join your voice channel. ${member.id}`);
        }
        const title = res.playlist ? res.playlist.title : res.tracks[0].title;

        await interaction.editReply(`Added \`${title}\` to the queue!`);
        res.playlist ? queue.addTracks(res.tracks) : queue.addTrack(res.tracks[0]);

        if (!queue.playing) {
            await queue.play();
            // const current = queue.current;

            // const embed = new EmbedBuilder()
            //     .setColor("Random")
            //     .setTitle("Now Playing:")
            //     .setDescription(`[${current.title}](${current.url})`)
            //     .setURL(current.url)
            //     .addFields(
            //         {name: 'Requested By', value: member.user.tag},
            //         {name: 'Duration', value: current.duration}
            //     )
            // await queue.metadata!.send({embeds: [embed]})
            await queue.metadata!.send(`Now playing: \`${res.tracks[0].title}\``);
        }
        
    
    }
} as ISlashCommand;