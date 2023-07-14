import {
  ActionRowBuilder,
  ButtonBuilder,
  EmbedBuilder,
  Emoji,
  GuildBan,
} from 'discord.js';

import { ButtonStyle } from 'discord-api-types/v10';
import { MessageActionRowComponentBuilder } from '@discordjs/builders';
import { Channels } from '@cmnw/mongo';

export const banEmbed = (guildBan: GuildBan, emoji: Emoji) =>
  new EmbedBuilder()
    .setDescription(`**${guildBan.user.username}** заблокирован на:`)
    .setColor('#2b2d31')
    .addFields({
      name: '\u200B',
      value: `${emoji} - ✅`,
      inline: true,
    });

export const banButtons = (guildBan: GuildBan, logsChannel: Channels) =>
  new ActionRowBuilder().addComponents(
    new ButtonBuilder()
      .setCustomId(guildBan.user.id)
      .setLabel('Заблокировать')
      .setStyle(ButtonStyle.Danger),
    new ButtonBuilder()
      .setLabel('История банов')
      .setURL(
        `https://discord.com/channels/${logsChannel.guildId}/${logsChannel._id}`,
      )
      .setStyle(ButtonStyle.Secondary),
  ) as ActionRowBuilder<MessageActionRowComponentBuilder>;
