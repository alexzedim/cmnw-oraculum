import { SlashCommandBuilder, TextChannel } from 'discord.js';
import {
  COMMAND_DESCRIPTION_ENUMS,
  COMMAND_ENUMS,
  SlashCommand,
} from '@cmnw/commands';

import {
  FEFENYA_COMMANDS,
  FEFENYA_DESCRIPTION,
  FEFENYA_STORAGE_KEYS,
  GOTD_GREETING_FLOW,
  GOTD_SELECTED_FLOW,
  gotdGreeter,
  gotdSelected,
  cryptoRandomIntBetween,
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

      const isGotdTriggered = Boolean(
        await redis.exists(FEFENYA_STORAGE_KEYS.GOTD_TOD_STATUS),
      );

      if (isGotdTriggered) {
        const gotdUser = await redis.get(FEFENYA_STORAGE_KEYS.GOTD_TOD_STATUS);
        const greetingSelectedFlow = GOTD_SELECTED_FLOW.random();

        await interaction.reply({
          content: gotdSelected(greetingSelectedFlow, gotdUser),
          ephemeral: false,
        });
      }

      logger.debug(
        `Selecting gay lord of the day from: ${interaction.guild.id}`,
      );

      const { usersFefenyaModel } = models;

      const int = await usersFefenyaModel.count();
      const randomInt = cryptoRandomIntBetween(0, int - 1);

      logger.log(
        `Fefenya randomize in between ${int} values, roll is ${randomInt}`,
      );

      const fefenyaUser = await usersFefenyaModel.findOneAndUpdate(
        {
          guildId: interaction.guildId,
        },
        {
          $inc: { count: 1 },
        },
        {
          skip: randomInt,
          new: true,
        },
      );

      logger.log(`Fefenya pre-pick user as a gaylord: ${fefenyaUser._id}`);

      const greetingFlow = GOTD_GREETING_FLOW.random();
      const arrLength = greetingFlow.length;
      let content: string;

      await redis.set(
        FEFENYA_STORAGE_KEYS.GOTD_TOD_STATUS,
        fefenyaUser.username,
      );

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
