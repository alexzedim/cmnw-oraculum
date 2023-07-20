import { EmbedBuilder, SlashCommandBuilder } from 'discord.js';
import { SlashCommand } from '@cmnw/commands/types';
import { FEFENYA_COMMANDS, FEFENYA_DESCRIPTION } from '@cmnw/core';
import { Fefenya } from '@cmnw/mongo';
import { COMMAND_DESCRIPTION_ENUMS, COMMAND_ENUMS } from '@cmnw/commands/enums';

export const gotsStatsCommand: SlashCommand = {
  name: COMMAND_ENUMS.FEFENYA_GOTS_STATS,
  description: COMMAND_DESCRIPTION_ENUMS.FEFENYA_GOTD_STATS,
  slashCommand: new SlashCommandBuilder()
    .setName(FEFENYA_COMMANDS.GOTS_STATS)
    .setDescription(FEFENYA_DESCRIPTION.GOTD_STATS),

  async executeInteraction({ interaction, models, logger }): Promise<void> {
    if (!interaction.isChatInputCommand()) return;
    try {
      const { usersFefenyaModel } = models;

      const usersFefenya = await usersFefenyaModel
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

      await interaction.reply({
        embeds: [embed],
        ephemeral: false,
      });
    } catch (errorOrException) {
      logger.error(errorOrException);
      await interaction.reply({
        content: errorOrException.message,
        ephemeral: true,
      });
    }
  },
};
