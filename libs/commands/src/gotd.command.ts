import { SlashCommandBuilder, TextChannel } from 'discord.js';
import { UsersFefenya } from '@cmnw/mongo';
import {
  COMMAND_DESCRIPTION_ENUMS,
  COMMAND_ENUMS,
  SlashCommand,
} from '@cmnw/commands';

import {
  FEFENYA_COMMANDS,
  FEFENYA_DESCRIPTION,
  GOTD_GREETING_FLOW,
  GOTD_SELECTED_FLOW,
  gotdGreeter,
  gotdSelected,
  cryptoRandomIntBetween,
  pickRandomFefenyaUser,
} from '@cmnw/core';

export const gotdCommand: SlashCommand = {
  name: COMMAND_ENUMS.FEFENYA_GOTD,
  description: COMMAND_DESCRIPTION_ENUMS.FEFENYA_GOTD,
  slashCommand: new SlashCommandBuilder()
    .setName(FEFENYA_COMMANDS.GOTD)
    .setDescription(FEFENYA_DESCRIPTION.GOTD),

  async executeInteraction({ interaction, redis, logger, models }) {
    if (!interaction.isChatInputCommand()) return;
    try {
      logger.log(`${FEFENYA_COMMANDS.GOTD} has been triggered`);

      let fefenyaUser = await models.usersFefenyaModel.findOne<UsersFefenya>({
        guildId: interaction.guildId,
        isGotd: true,
      });

      if (fefenyaUser) {
        const greetingSelectedFlow = GOTD_SELECTED_FLOW.random();

        await interaction.reply({
          content: gotdSelected(greetingSelectedFlow, fefenyaUser.username),
          ephemeral: false,
        });

        return;
      }

      logger.debug(
        `Selecting gay lord of the day from: ${interaction.guild.id}`,
      );

      fefenyaUser = await pickRandomFefenyaUser(
        models.usersFefenyaModel,
        interaction.guildId,
      );

      logger.log(
        `Fefenya pre-pick user as a gaylord: ${fefenyaUser._id} :: ${fefenyaUser.username}`,
      );

      const greetingFlow = GOTD_GREETING_FLOW.random();
      const arrLength = greetingFlow.length;
      let content: string;

      for (let i = 0; i < arrLength; i++) {
        content =
          arrLength - 1 === i
            ? gotdGreeter(greetingFlow[i], fefenyaUser.id)
            : greetingFlow[i];

        if (i === 0) {
          await interaction.reply({
            content,
            ephemeral: false,
          });
        } else {
          await (interaction.channel as TextChannel).send({ content });
        }
      }
    } catch (errorOrException) {
      logger.error(errorOrException);
      await interaction.reply({
        content: errorOrException.message,
        ephemeral: true,
      });
    }
  },
};
