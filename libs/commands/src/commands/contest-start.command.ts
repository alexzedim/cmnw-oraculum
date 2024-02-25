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
  randomMixMax,
  waitForDelay,
} from '@cmnw/core';
import { Prompts } from '@cmnw/mongo';

export const contestStartCommand: SlashCommand = {
  name: CONTEST_START_ENUM.NAME,
  description: CONTEST_START_ENUM.DESCRIPTION,
  slashCommand: CONTEST_START,

  executeInteraction: async function ({ interaction, logger, models, redis }) {
    if (!interaction.isChatInputCommand()) return;

    const { fefenyaModel, promptsModel, contestModel } = models;

    const { guild, client, user } = interaction;
    let { channel } = interaction;

    // TODO index every user command triggered
    const guildId = guild.id;
    const contestEntity = await getContest(contestModel, guildId);
    const fefenyaName = FEFENYA_NAMING.random();
    const { guildKey, commandKey } = generateKey({
      command: COMMAND_ENUMS.FEFENYA_TROPHY,
      guildId,
      userId: user.id,
    });

    try {
      const contestPrompts = await promptsModel
        .find<Prompts>({
          blockId: contestEntity.blockId,
          position: 1,
        })
        .sort({ position: 1 });

      const isChannelContest =
        channel.id === contestEntity.channelId && channel.isTextBased();

      if (!isChannelContest) {
        channel = guild.channels.cache.get(
          contestEntity.channelId,
        ) as TextChannel;
      }

      for (const contestPrompt of contestPrompts) {
        const contestText = prettyContestPrompt(
          contestPrompt.text,
          fefenyaName,
          contestEntity.title,
        );

        const delayTime = randomMixMax(1, 10);
        await waitForDelay(delayTime);

        await channel.send({ content: contestText });
      }
    } catch (e) {

    }

    try {
      logger.log(`${COMMAND_ENUMS.FEFENYA_TROPHY} triggered by ${user.id}`);

      // TODO contest

      const errorPrompt = await getRandomReplyByEvent(
        promptsModel,
        PROMPT_TYPE_ENUM.ERROR,
      );

      const errorContent = prettyContestPrompt(
        errorPrompt.text,
        fefenyaName,
        contestEntity.title,
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
        fefenyaName,
        contestEntity.title,
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
