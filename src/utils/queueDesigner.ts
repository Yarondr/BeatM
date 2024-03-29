import { EmbedBuilder, Guild, GuildMember } from "discord.js";
import { Player } from '@yarond/erela.js';
import { convertMilisecondsToTime, haveLiveTrack, isTrackLive } from "./player";

export async function designQueue(player: Player, guild: Guild, page: number) {
    const queue = player.queue;
    const current = queue.current!;
    const requester = current.requester! as string;
    const space = queue.length > 0 ? "\n\u200b" : "";
    const duration = isTrackLive(current) ? "LIVE" : convertMilisecondsToTime(current.duration!);
    const nowPlaying = current ?
        ` [${current.originalTitle!}](${current.originalUri!}) | \`${duration} Requested by: ${requester}\`` :
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
            index += page * 10;
            const requester = track.requester! as string;
            const duration = isTrackLive(track) ? "LIVE" : convertMilisecondsToTime(track.duration!);
            const value = `\`${index + 1}.\` [${track.originalTitle}](${track.originalUri}) | \`${duration} Requested by: ${requester}\``
            const title = index == 0 ? "Up Next:" : "\u200b";
            embed.addFields({name: title, value: value, inline: false});
        }).join('\n');
    const songsText = queue.length > 1 ? "songs" : "song";
    const totalTime = queue.length > 0
        ? haveLiveTrack(queue) ? "Infinite" : convertMilisecondsToTime(queue.duration)
        : "0:00";
    embed.addFields(
        {name: "\u200b", value: `**${queue.length} ${songsText} waiting in queue | ${totalTime} total length**`, inline: false},
        {name: "\u200b", value: `Queue page: ${page + 1} of ${Math.ceil(queue.length / 10)}`, inline: false}
    );
    embed.setFooter({text: `Loop: ${loopMethod}`});
    embed.setTimestamp();

    // TODO: set footer to page number with loop and queue loop

    return embed;
}