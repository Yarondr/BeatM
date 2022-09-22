import { AutocompleteInteraction, GuildMember } from "discord.js";
import { getMember } from "../djs";
import { basicSearch } from "../player";
import { isURL } from "../url";
import { IBot } from "./IBot";

export async function playSearchAutocomplete(bot: IBot, interaction: AutocompleteInteraction) {
    if (!interaction.isAutocomplete()) return;
    const focusedValue = interaction.options.getFocused();
    const search = focusedValue;
    if (isURL(search)) return await interaction.respond([]);
    const choices: string[] = [];

    const guild = bot.client.guilds.cache.get(interaction.guildId!)!;
    const member: GuildMember = await getMember(guild, interaction.member?.user.id!);
    const res = await basicSearch(member.user.tag, bot.manager, search);
    res.tracks.slice(0, 6).forEach(track => choices.push(track.title));
    return await interaction.respond(choices.map((choice) => ({ name: choice, value: choice })));
}