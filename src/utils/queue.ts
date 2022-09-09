import { Queue } from "discord-player";
import { ButtonInteraction, CommandInteraction, EmbedBuilder, Guild } from "discord.js";
import { IQueueMetadata } from "./interfaces/IQueueMetadata";
import { convertMilisecondsToTime, haveLiveTrack, isTrackLive } from "./player";

export async function designQueue(queue: Queue<IQueueMetadata>, guild: Guild, page: number) {
    const current = queue.current;
    const space = queue.tracks.length > 0 ? "\n\u200b" : "";
    const duration = isTrackLive(current) ? "LIVE" : convertMilisecondsToTime(current.durationMS);
    const nowPlaying = current ?
        ` [${current.title}](${current.url}) | \`${duration} Requested by: ${current.requestedBy.tag}\`` :
        `Nothing`
    const loopMethods = ['disabled', 'track', 'queue'];
    
    // build the embed message
    const embed = new EmbedBuilder();
    embed.setColor("Random");
    embed.setTitle(`Queue for ${guild.name}`);
    embed.setURL(`https://discord.com`);
    embed.addFields({name: "Now Playing:", value: nowPlaying + space, inline: false});

    // add tracks to embed
    queue.tracks.slice(page * 10, page * 10 + 10)
        .map((track, index) => {
            const duration = isTrackLive(track) ? "LIVE" : convertMilisecondsToTime(track.durationMS);
            const value = `\`${index + 1}.\` [${track.title}](${track.url}) | \`${duration} Requested by: ${track.requestedBy.tag}\``
            const title = index == 0 ? "Up Next:" : "\u200b";
            embed.addFields({name: title, value: value, inline: false});
        }).join('\n');
    const songsText = queue.tracks.length > 1 ? "songs" : "song";
    const totalTime = queue.tracks.length > 0
        ? haveLiveTrack(queue) ? "Infinite" : convertMilisecondsToTime(queue.totalTime)
        : "0:00";
    embed.addFields({name: "\u200b", value: `**${queue.tracks.length} ${songsText} waiting in queue | ${totalTime} total length**`, inline: false});
    embed.setFooter({text: "Loop: " + loopMethods[queue.repeatMode]});
    embed.setTimestamp();

    // TODO: set footer to page number with loop and queue loop

    return embed;
}