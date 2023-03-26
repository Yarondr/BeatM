import { GuildMember, Interaction, TextChannel } from "discord.js";
import * as fs from "fs";
import path from "path";
import { getFiles, hasFolders } from "../utils/filesReader";
import { IBot } from "../utils/interfaces/IBot";
import { ISlashCommand } from "../utils/interfaces/ISlashCommand";
import { isDJ } from "../utils/player";

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
            
            bot.slashCommands.set(command.data.name, command)
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
        .filter((command) => order.includes(command.data.name))
        .sort((a, b) => order.indexOf(a.data.name) - order.indexOf(b.data.name))
}

export async function handleSlashCommand(interaction: Interaction, slashCommand: ISlashCommand | undefined, bot: IBot, checksOnly: boolean = false) {
    if (!interaction.isCommand() || !interaction.inCachedGuild()) return;
    if (!slashCommand) return interaction.reply("This command does not exist!");

    await interaction.deferReply({ ephemeral: slashCommand.ephemeral || false }).catch(() => {});

    const { owners, client } = bot;
    const channel = interaction.channel as TextChannel;
    const member: GuildMember = interaction.member;
    

    if (slashCommand.ownerOnly && !owners.includes(member.id)) {
        return interaction.editReply("This command is only for developers!");
    }

    if (slashCommand.DJOnly && !isDJ(member)) {
        return interaction.editReply("This command is only for DJs!");
    }
    
    if (slashCommand.permissions && !channel.permissionsFor(member).has(slashCommand.permissions)) {
        const missingPerms = channel.permissionsFor(member).missing(slashCommand.permissions!)
        return interaction.editReply(`You don't have permission to use this command!\nMissing permissions: ${missingPerms?.join(', ')}`);
    }
    
    if (slashCommand.botPermissions && !channel?.permissionsFor(client.user!)?.has(slashCommand.botPermissions)) {
        const missingPerms = channel?.permissionsFor(client.user!)?.missing(slashCommand.botPermissions)
        return interaction.editReply(`I don't have the required permissions to use this command!\nMissing permissions: ${missingPerms?.join(', ')}`);
    }

    if (!slashCommand.ignoreNotSameVoiceChannels && slashCommand.category == "Music Commands") {
        let player = bot.manager.get(interaction.guildId!);
        if (!member.voice.channel) {
            return interaction.editReply("You must be in a voice channel to use this command!.");
        }
        if (!player || player.state != "CONNECTED") {
            return interaction.editReply("I'm not in a voice channel!");
        }
        if (member.voice.channel.id != player.voiceChannel) {
            return interaction.editReply("You must be in the same voice channel as the bot to use this command.");
        }
    }

    if (checksOnly) return;
    
    try {
        await slashCommand.execute(bot, interaction).catch((err) => {
            console.log(err);
        });

    } catch (e) {
        console.error(e);
    }
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
    'help',
    'ping'
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