import {
  ISlashCommand,
  ISlashCommandArgs,
  RAINY_IMAGES_PAGE,
  RAINY_PAGES,
} from '@cmnw/shared';

import { PaginatedEmbed } from 'embed-paginator';
import { SlashCommandBuilder } from '@discordjs/builders';
import { TextChannel } from 'discord.js';

export const PovCommand: ISlashCommand = {
  name: 'pov',
  description: 'как мне найти стрим моей специализации?',
  guildOnly: true,
  slashCommand: new SlashCommandBuilder()
    .setName('pov')
    .setDescription('как мне найти стрим моей специализации?'),

  async executeInteraction({ interaction }: ISlashCommandArgs) {
    if (!interaction.isChatInputCommand()) return;
    try {
      const embed = new PaginatedEmbed({
        itemsPerPage: RAINY_PAGES.length,
        paginationType: 'field',
        showFirstLastBtns: true,
      })
        .setDescriptions(RAINY_PAGES)
        .setImages(RAINY_IMAGES_PAGE)
        .setFooters([{ text: 'Hello {page}' }, { text: 'Foo {page}' }])
        .setTitles([
          '**Находим стрим или видео POV по вашей специлизации!**',
          '**Находим стрим или видео POV по вашей специлизации!**',
          '**Находим стрим или видео POV по вашей специлизации!**',
          '**Находим стрим или видео POV по вашей специлизации!**',
        ])
        .setTimestamp();

      await embed.send({
        options: { channel: interaction.channel as TextChannel },
      });
    } catch (errorOrException) {
      console.error(errorOrException);
      await interaction.reply({
        content: errorOrException.message,
        ephemeral: true,
      });
    }
  },
};
