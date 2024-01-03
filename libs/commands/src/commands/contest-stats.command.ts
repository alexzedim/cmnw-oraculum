import { EmbedBuilder } from 'discord.js';
import { Contests, Fefenya } from '@cmnw/mongo';
import {
  COMMAND_ENUMS,
  CONTEST_TOP,
  CONTEST_TOP_ENUM,
  contestEmbed,
  SlashCommand,
} from '@cmnw/commands';

import {
  getRandomReplyByEvent,
  PROMPT_TYPE_ENUM,
  randomMixMax,
} from '@cmnw/core';

export const contestStatsCommand: SlashCommand = {
  name: CONTEST_TOP_ENUM.NAME,
  description: CONTEST_TOP_ENUM.DESCRIPTION,
  slashCommand: CONTEST_TOP,

  executeInteraction: async function ({ interaction, models, logger, redis }) {
    if (!interaction.isChatInputCommand()) return;

    const [guildId, userId] = [interaction.guildId, interaction.user.id];
    const { fefenyaModel, contestModel } = models;

    try {
      const ignoreSeconds = randomMixMax(60 * 30, 60 * 60);
      const guildIgnoreKey = `${COMMAND_ENUMS.FEFENYA_TOP}:${guildId}`;
      const userIgnoreKey = `${COMMAND_ENUMS.FEFENYA_TOP}:${guildId}:${userId}`;

      const [incrGuild, incrGuildMember] = await Promise.all([
        redis.incr(guildIgnoreKey),
        redis.incr(userIgnoreKey),
      ]);

      await Promise.all([
        redis.expire(userIgnoreKey, ignoreSeconds),
        redis.expire(guildIgnoreKey, ignoreSeconds),
      ]);

      const isIgnore = incrGuild > 1 || incrGuildMember > 1;
      if (isIgnore) {
        const ignorePrompt = await getRandomReplyByEvent(
          models.promptsModel,
          PROMPT_TYPE_ENUM.IGNORE,
        );

        return await interaction.reply({
          content: ignorePrompt.text,
          ephemeral: incrGuild > 3,
        });
      }

      const fefenyas = await fefenyaModel
        .find<Fefenya>({ guildId: interaction.guildId })
        .limit(10)
        .sort({ count: -1 });

      const now = new Date();
      const contest = await contestModel.findOne<Contests>({
        guildId,
      });

      const embed = contestEmbed(contest.title);

      for (const fefenya of fefenyas) {
        embed.addFields({
          name: `${fefenya.username}`,
          value: `${fefenya.count}`,
          inline: true,
        });
      }

      return await interaction.reply({
        embeds: [embed],
        ephemeral: false,
      });
    } catch (errorOrException) {
      logger.error(errorOrException);

      const errorPrompt = await getRandomReplyByEvent(
        models.promptsModel,
        PROMPT_TYPE_ENUM.ERROR,
      );
      return await interaction.reply({
        content: errorPrompt.text,
        ephemeral: false,
      });
    }
  },
};
