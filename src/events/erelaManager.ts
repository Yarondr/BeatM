import { Track } from "@yarond/erela.js";
import { TextChannel } from "discord.js";
import { IBot } from "../utils/interfaces/IBot";
import { basicSearch, buildPlayingNowEmbed, scheduleQueueLeave } from "../utils/player";

export let bot: IBot | undefined;

module.exports = (bot: IBot) => {
    bot.manager.on('trackStuck', (player, track, payload) => {
        player.stop();
    });

    bot.manager.on('trackStart', async (player, track) => {
        player.set(`previoustrack`, track);

        if (bot.queuesWaitingToLeave.has(player.guild)) {
            clearTimeout(bot.queuesWaitingToLeave.get(player.guild));
            bot.queuesWaitingToLeave.delete(player.guild);
        }

        const textChannel = await player.get('textChannel') as TextChannel;
        if (!textChannel.permissionsFor(bot.client.user!)?.has('SendMessages')) return;

        const embed = buildPlayingNowEmbed(track, track.requester! as string);
        await textChannel.send({ embeds: [embed] }).catch( async () => { 
            await textChannel.send("Now playing: " + track.originalTitle +
            "\n\nPlease give me the permission to send embeds in this channel.");
        });
    });

    bot.manager.on('queueEnd', async (player) => {
        const autoplay = await player.get('autoplay') as boolean;
        if (!autoplay) return await scheduleQueueLeave(bot, player);
        
        const track = await player.get('previoustrack') as Track | undefined;
        if (!track) return await scheduleQueueLeave(bot, player);

        const identifier = track.identifier;
        const url = `https://www.youtube.com/watch?v=${identifier}&list=RD${identifier}`;
        const res = await basicSearch(`Autoplay (enabled by ${track.requester})`, bot.manager, url);
        if (res) {
            player.queue.add(res.tracks[1]);
            await player.play().catch((err) => console.log(err));
        }
    });
}