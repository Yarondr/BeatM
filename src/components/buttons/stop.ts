import { ButtonInteraction } from "discord.js";
import { Player } from "erela.js";
import { IBot } from "../../utils/interfaces/IBot";
import { IButton } from "../../utils/interfaces/IButton";
import { ICommandArgs } from "../../utils/interfaces/ICommandArgs";

module.exports = {
    execute: async (bot: IBot, player: Player, interaction: ButtonInteraction, args: ICommandArgs) => {
        const { member, guild, channel } = args;

        if (!player.queue.current) {
            return interaction.editReply("Can't stop, I am not playing anything right now!");
        }

        player.stop();
        //TODO:
        // player = createPlayer(guild, bot.manager, member.voice.channel!, channel);
        // player.connect();
        return interaction.editReply("Stopped!");
    }
} as IButton