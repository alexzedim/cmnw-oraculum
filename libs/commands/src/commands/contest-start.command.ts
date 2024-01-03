import { TextChannel } from 'discord.js';
import {
  COMMAND_ENUMS,
  generateKey,
  SlashCommand,
  CONTEST_START_ENUM,
  CONTEST_START,
} from '@cmnw/commands';

import {
  getRandomReplyByEvent,
  PROMPT_TYPE_ENUM,
  getContest,
  prettyContestPrompt,
  FEFENYA_NAMING,
} from '@cmnw/core';

export const contestStartCommand: SlashCommand = {
  name: CONTEST_START_ENUM.NAME,
  description: CONTEST_START_ENUM.DESCRIPTION,
  slashCommand: CONTEST_START,

  executeInteraction: async function ({ interaction, logger, models, redis }) {
    if (!interaction.isChatInputCommand()) return;

    const { fefenyaModel, promptsModel, contestModel } = models;

    const [guildId, client, user, channel] = [
      interaction.guildId,
      interaction.client,
      interaction.user,
      interaction.channel as TextChannel,
    ];

    // TODO index every user command triggered

    const contest = await getContest(contestModel, guildId);
    const fefenyaOwnNaming = FEFENYA_NAMING.random();
    const { guildKey, commandKey } = generateKey({
      command: COMMAND_ENUMS.FEFENYA_TROPHY,
      guildId,
      userId: user.id,
    });

    try {
      logger.log(`${COMMAND_ENUMS.FEFENYA_TROPHY} triggered by ${user.id}`);

      const errorPrompt = await getRandomReplyByEvent(
        promptsModel,
        PROMPT_TYPE_ENUM.ERROR,
      );

      const errorContent = prettyContestPrompt(
        errorPrompt.text,
        fefenyaOwnNaming,
        contest.title,
        '',
      );

      return await interaction.channel.send({
        content: errorContent,
      });
    } catch (errorOrException) {
      logger.error(errorOrException);

      const errorPrompt = await getRandomReplyByEvent(
        promptsModel,
        PROMPT_TYPE_ENUM.ERROR,
      );

      const errorContent = prettyContestPrompt(
        errorPrompt.text,
        fefenyaOwnNaming,
        contest.title,
        '',
      );

      return await interaction.channel.send({
        content: errorContent,
      });
    } finally {
      await redis.del(guildKey);
    }
  },
};
