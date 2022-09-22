import { Manager } from '@yarond/erela.js';
import { Client, Collection } from "discord.js";
import { IEvent } from "./IEvent";
import { ISlashCommand } from "./ISlashCommand";

export interface IBot {
    client: Client,
    events: Collection<string, IEvent>,
    slashCommands: Collection<string, ISlashCommand>,
    owners: string[],
    testServers: string[],
    prefix: string,
    manager: Manager,
    queuesWaitingToLeave: Map<string, NodeJS.Timeout>
    emptyChannelsWaitingToLeave: Map<string, NodeJS.Timeout>
}