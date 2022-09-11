import { ButtonInteraction, CommandInteraction, EmbedBuilder, Guild, GuildMember } from "discord.js";
import { Player, Queue } from "erela.js";
import { IQueueMetadata } from "./interfaces/IQueueMetadata";
import { convertSecondsToTime, haveLiveTrack, isTrackLive } from "./player";

export async function designQueue(player: Player, guild: Guild, page: number) {
    const queue = player.queue;
    const current = queue.current!;
    const requester = current.requester! as GuildMember;
    const space = queue.length > 0 ? "\n\u200b" : "";
    const duration = isTrackLive(current) ? "LIVE" : convertSecondsToTime(current.duration!);
    const nowPlaying = current ?
        ` [${current.title}](${current.uri}) | \`${duration} Requested by: ${requester.user.tag}\`` :
        `Nothing`
    const loopMethods = ['disabled', 'track', 'queue'];
    const loopMethod = player.trackRepeat ? loopMethods[1] : player.queueRepeat ? loopMethods[2] : loopMethods[0];
    
    // build the embed message
    const embed = new EmbedBuilder();
    embed.setColor("Random");
    embed.setTitle(`Queue for ${guild.name}`);
    embed.setURL(`https://discord.com`);
    embed.addFields({name: "Now Playing:", value: nowPlaying + space, inline: false});

    // add tracks to embed
    queue.slice(page * 10, page * 10 + 10)
        .map((track, index) => {
            const requester = track.requester! as GuildMember;
            const duration = isTrackLive(track) ? "LIVE" : convertSecondsToTime(track.duration!);
            const value = `\`${index + 1}.\` [${track.title}](${track.uri}) | \`${duration} Requested by: ${requester.user.tag}\``
            const title = index == 0 ? "Up Next:" : "\u200b";
            embed.addFields({name: title, value: value, inline: false});
        }).join('\n');
    const songsText = queue.length > 1 ? "songs" : "song";
    const totalTime = queue.length > 0
        ? haveLiveTrack(queue) ? "Infinite" : convertSecondsToTime(queue.duration)
        : "0:00";
    embed.addFields({name: "\u200b", value: `**${queue.length} ${songsText} waiting in queue | ${totalTime} total length**`, inline: false});
    embed.setFooter({text: `Loop: ${loopMethod}`});
    embed.setTimestamp();

    // TODO: set footer to page number with loop and queue loop

    return embed;
}

export function createProgressBar(player: Player) {
    const currentTime = player.queue.current?.duration !== 0 ? player.position : player.queue.current.duration;
    const totalTime = player.queue.current?.duration!;
    const length = 15;
    const dot = ":radio_button:"
    const dash = "▬"
    let progress = Math.floor(length * (currentTime / totalTime))
    let line = "";
    for (let index = 0; index <= length; index++) {
        index == progress ? line += dot : line += dash;
    }
    return line;
}