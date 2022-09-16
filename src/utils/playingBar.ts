import { Player } from 'erela.js/src';
import { convertMilisecondsToTime } from "./player";

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
    line = convertMilisecondsToTime(currentTime) + " ┃ " + line + " ┃ " + convertMilisecondsToTime(totalTime);
    return line;
}