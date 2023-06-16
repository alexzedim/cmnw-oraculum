import {
  ISlashCommand,
  ISlashCommandArgs,
  RAINY_IMAGES_PAGE,
  RAINY_PAGES,
} from '@cmnw/shared';

import {
  MessageActionRowComponentBuilder,
  SlashCommandBuilder,
} from '@discordjs/builders';

import { ActionRowBuilder, ButtonBuilder, EmbedBuilder } from 'discord.js';
import { ButtonStyle } from 'discord-api-types/v10';
import { PaginatedEmbed } from 'embed-paginator';

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
      const [firstPage] = RAINY_PAGES;
      const [firstImagePage] = RAINY_IMAGES_PAGE;
      const endPageCursor = RAINY_PAGES.length;

      const embed = new EmbedBuilder()
        .setColor('#2b2d31')
        .setTitle('**Находим стрим или видео POV по вашей специлизации!**')
        .setDescription(firstPage)
        .setImage(firstImagePage)
        .setFooter({
          text: 'Информация оформлена сервером "Обитель Света"',
          iconURL: 'https://i.imgur.com/OBDcu7K.png',
        });

      const buttons = [
        new ActionRowBuilder().addComponents(
          new ButtonBuilder()
            .setCustomId(`${interaction.user.id}.FF.0`)
            .setEmoji('⏪')
            .setStyle(ButtonStyle.Secondary),
        ) as ActionRowBuilder<MessageActionRowComponentBuilder>,
        new ActionRowBuilder().addComponents(
          new ButtonBuilder()
            .setCustomId(`${interaction.user.id}.R.1`)
            .setEmoji('⬅️')
            .setStyle(ButtonStyle.Secondary),
        ) as ActionRowBuilder<MessageActionRowComponentBuilder>,
        new ActionRowBuilder().addComponents(
          new ButtonBuilder()
            .setCustomId(`${interaction.user.id}.F.1`)
            .setEmoji('➡️')
            .setStyle(ButtonStyle.Secondary),
        ) as ActionRowBuilder<MessageActionRowComponentBuilder>,
        new ActionRowBuilder().addComponents(
          new ButtonBuilder()
            .setCustomId(`${interaction.user.id}.FF.${endPageCursor}`)
            .setEmoji('⏩')
            .setStyle(ButtonStyle.Secondary),
        ) as ActionRowBuilder<MessageActionRowComponentBuilder>,
        new ActionRowBuilder().addComponents(
          new ButtonBuilder()
            .setLabel('Фидбек')
            .setURL(
              'https://discord.com/channels/210643527472906241/1094552713292951563',
            )
            .setStyle(ButtonStyle.Secondary),
        ) as ActionRowBuilder<MessageActionRowComponentBuilder>,
      ];

      interaction.reply({
        embeds: [embed],
        components: buttons,
        ephemeral: false,
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
