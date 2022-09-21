import * as fs from "fs";
import path from "path";
import { getFiles, hasFolders } from "../utils/filesReader";
import { IBot } from "../utils/interfaces/IBot";
import { ISlashCommand } from "../utils/interfaces/ISlashCommand";

export function loadSlashCommands(bot: IBot, reload: boolean) {
    const { slashCommands} = bot;
    
    const commandsPath = path.join(__dirname, "../slashCommands");
    getFolderCommands(bot, commandsPath);
    console.log(`Loaded ${slashCommands.size} slash commands`)
}

function getFolderCommands(bot: IBot, folderPath: string, mainCategory: string = "") {
    fs.readdirSync(folderPath).forEach((category: string) => {
        const commandPath = path.join(folderPath, category);
        const slashCommandsFiles = getFiles(commandPath, ".ts");
        slashCommandsFiles.forEach((f) => {
            const command: ISlashCommand = require(`${commandPath}/${f}`)
            command.originalName = f.replace(".ts", "");
            if (mainCategory != "") {
                command.category = mainCategory;
                command.subcategory = category;
            } else {
                command.category = category;
            }
            
            bot.slashCommands.set(command.name, command)
        })

        if (hasFolders(commandPath)) {
            getFolderCommands(bot, commandPath, category);
        }
    });
}

export function getSubcategoryCommands(bot: IBot, subcategory: string) {
    let order: string[];
    subcategory == "General" ? order = generalCommandsOrder
        : subcategory == "Track" ? order = trackCommandsOrder
        : subcategory == "Queue" ? order = queueCommandsOrder 
        : order = filtersCommandsOrder;

    return bot.slashCommands
        .filter((command) => order.includes(command.name))
        .sort((a, b) => order.indexOf(a.name) - order.indexOf(b.name))
}

const generalCommandsOrder = [
    'join',
    'leave',
    'play',
    'playnext',
    'search',
    'skip',
    'forceskip',
    'volume',
    'controller',
    'help'
];

const trackCommandsOrder = [
    'nowplaying',
    'pause',
    'resume',
    'skipto',
    'forward',
    'backward',
    'replay',
    'loop',
    'save'
]

const queueCommandsOrder = [
    'queue',
    'jumpto',
    'back',
    'remove',
    'clear',
    'stop',
    'move',
    'shuffle',
    'queueloop',
    'autoplay'
]

const filtersCommandsOrder = [
    '8d',
    'bassboost',
    'nightcore',
    'karaoke',
    'treble',
    'tremolo',
    'vibrato',
    'vaporwave',
    'soft',
    'pop',
    'clearfilters'
]