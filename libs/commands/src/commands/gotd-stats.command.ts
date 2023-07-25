import { EmbedBuilder, SlashCommandBuilder } from 'discord.js';
import { Fefenya } from '@cmnw/mongo';
import {
  COMMAND_DESCRIPTION_ENUMS,
  COMMAND_ENUMS,
  SlashCommand,
} from '@cmnw/commands';

import {
  FEFENYA_COMMANDS,
  FEFENYA_DESCRIPTION,
  getRandomDialog,
  PROMPT_TYPE_ENUM,
  randomMixMax,
} from '@cmnw/core';

export const gotsStatsCommand: SlashCommand = {
  name: COMMAND_ENUMS.FEFENYA_GOTS_STATS,
  description: COMMAND_DESCRIPTION_ENUMS.FEFENYA_GOTD_STATS,
  slashCommand: new SlashCommandBuilder()
    .setName(FEFENYA_COMMANDS.GOTS_STATS)
    .setDescription(FEFENYA_DESCRIPTION.GOTD_STATS),

  executeInteraction: async function ({ interaction, models, logger, redis }) {
    if (!interaction.isChatInputCommand()) return;

    const [guildId, userId] = [interaction.guildId, interaction.user.id];
    const { fefenyaModel } = models;

    try {
      const ignoreSeconds = randomMixMax(60 * 30, 60 * 60);
      const guildIgnoreKey = `${COMMAND_ENUMS.FEFENYA_GOTS_STATS}:${guildId}`;
      const userIgnoreKey = `${COMMAND_ENUMS.FEFENYA_GOTS_STATS}:${guildId}:${userId}`;

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
        const ignorePrompt = await getRandomDialog(
          models.promptsModel,
          PROMPT_TYPE_ENUM.IGNORE,
        );

        return await interaction.reply({
          content: ignorePrompt.text,
          ephemeral: incrGuild > 3,
        });
      }

      const usersFefenya = await fefenyaModel
        .find<Fefenya>({ guildId: interaction.guildId })
        .limit(10)
        .sort({ count: -1 });

      const now = new Date();

      const embed = new EmbedBuilder()
        .setColor(0x0099ff)
        .setTitle(':rainbow_flag: Зал славы :transgender_flag: ')
        .setTimestamp(now)
        .setFooter({
          text: 'CMNW',
          iconURL: 'https://i.imgur.com/OBDcu7K.png',
        });

      for (const gotdEntity of usersFefenya) {
        embed.addFields({
          name: `${gotdEntity.username}`,
          value: `${gotdEntity.count}`,
          inline: true,
        });
      }

      return await interaction.reply({
        embeds: [embed],
        ephemeral: false,
      });
    } catch (errorOrException) {
      logger.error(errorOrException);

      const errorPrompt = await getRandomDialog(
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
