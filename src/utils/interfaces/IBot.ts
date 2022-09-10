import { Player } from "discord-player";
import { Client, Collection, StageChannel, VoiceChannel } from "discord.js";
import { ICommand } from "./ICommand";
import { IEvent } from "./IEvent";
import { ISlashCommand } from "./ISlashCommand";

export interface IBot {
    client: Client,
    commands: Collection<string, ICommand>,
    events: Collection<string, IEvent>,
    slashCommands: Collection<string, ISlashCommand>,
    owners: string[],
    testServers: string[],
    prefix: string,
    player: Player,
    queuesWaitingToLeave: Map<string, NodeJS.Timeout>
    emptyChannelsWaitingToLeave: Map<string, NodeJS.Timeout>
}