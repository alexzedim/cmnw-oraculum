import { PermissionsBitField, SlashCommandBuilder } from 'discord.js';
import { from, lastValueFrom, mergeMap, range } from 'rxjs';
import { DateTime } from 'luxon';
import { Prompts } from '@cmnw/mongo';
import {
  COMMAND_DESCRIPTION_ENUMS,
  COMMAND_ENUMS,
  generateKey,
  GOTD_PARAMS_DESCRIPTION_ENUM,
  TROPHY_PARAMS_ENUM,
  SlashCommand,
} from '@cmnw/commands';

import {
  getRandomReplyByEvent,
  waitForDelay,
  randomMixMax,
  pickRandomFefenya,
  PROMPT_TYPE_ENUM,
  getContest,
  prettyContestPrompt,
  FEFENYA_NAMING,
  CHAT_ROLE_ENUM,
} from '@cmnw/core';

export const trophyContestCommand: SlashCommand = {
  name: COMMAND_ENUMS.FEFENYA_TROPHY,
  description: COMMAND_DESCRIPTION_ENUMS.FEFENYA_TROPHY,
  slashCommand: new SlashCommandBuilder()
    .setName(COMMAND_ENUMS.FEFENYA_TROPHY)
    .setDescription(COMMAND_DESCRIPTION_ENUMS.FEFENYA_TROPHY)
    .addStringOption((option) =>
      option
        .setName(TROPHY_PARAMS_ENUM.TROPHY)
        .setDescription(GOTD_PARAMS_DESCRIPTION_ENUM.TROPHY)
        .setRequired(false),
    )
    .addRoleOption((option) =>
      option
        .setName(TROPHY_PARAMS_ENUM.ROLE)
        .setDescription(GOTD_PARAMS_DESCRIPTION_ENUM.ROLE)
        .setRequired(false),
    ),

  executeInteraction: async function ({ interaction, logger, models, redis }) {
    if (!interaction.isChatInputCommand()) return;

    const { fefenyaModel, promptsModel, contestModel } = models;

    const [trophyRole, trophyName, guildId, clientId, userId, channelId] = [
      interaction.options.getRole(TROPHY_PARAMS_ENUM.ROLE, false),
      interaction.options.getString(TROPHY_PARAMS_ENUM.TROPHY, false),
      interaction.guildId,
      interaction.client.user.id,
      interaction.user.id,
      interaction.channelId,
    ];

    let contest = await getContest(contestModel, guildId);
    const name = FEFENYA_NAMING.random();
    const { guildKey, commandKey } = generateKey({
      command: COMMAND_ENUMS.FEFENYA_TROPHY,
      guildId,
      userId,
    });

    try {
      logger.log(`${COMMAND_ENUMS.FEFENYA_TROPHY} has been triggered`);

      const errorPrompt = await getRandomReplyByEvent(
        promptsModel,
        PROMPT_TYPE_ENUM.ERROR,
      );

      const errorContent = prettyContestPrompt(
        errorPrompt.text,
        name,
        contest.trophy,
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
        name,
        contest.trophy,
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
