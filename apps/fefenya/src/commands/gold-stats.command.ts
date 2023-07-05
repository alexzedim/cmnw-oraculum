import { EmbedBuilder, SlashCommandBuilder } from 'discord.js';
import { Repository } from 'typeorm';
import { FefenyaUsersEntity } from '@cmnw/pg';
import {
  FEFENYA_COMMANDS,
  FEFENYA_DESCRIPTION,
  ISlashCommand,
  ISlashCommandArgs,
} from '@cmnw/core';

export const GotsStatsCommand: ISlashCommand = {
  name: FEFENYA_COMMANDS.GOTS_STATS,
  description: FEFENYA_DESCRIPTION.GOTD_STATS,
  guildOnly: true,
  slashCommand: new SlashCommandBuilder()
    .setName(FEFENYA_COMMANDS.GOTS_STATS)
    .setDescription(FEFENYA_DESCRIPTION.GOTD_STATS),

  async executeInteraction({
    interaction,
    repository,
    logger,
  }: ISlashCommandArgs): Promise<void> {
    if (!interaction.isChatInputCommand()) return;
    try {
      const fefenyaUsersEntities = await (
        repository as Repository<FefenyaUsersEntity>
      ).find({
        where: { guildId: interaction.guildId },
        take: 10,
        order: {
          count: 'DESC',
        },
      });

      const now = new Date();

      const embed = new EmbedBuilder()
        .setColor(0x0099ff)
        .setTitle(':rainbow_flag: Зал славы :transgender_flag: ')
        .setTimestamp(now)
        .setFooter({
          text: 'CMNW',
          iconURL: 'https://i.imgur.com/OBDcu7K.png',
        });

      for (const gotdEntity of fefenyaUsersEntities) {
        embed.addFields({
          name: `${gotdEntity.name}`,
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
