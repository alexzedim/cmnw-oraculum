import { EmbedBuilder } from 'discord.js';
import { Contests, Roles } from '@cmnw/mongo';

export const contestEmbed = (contest: Contests, role: Roles) =>
  new EmbedBuilder()
    .setColor(0x0099ff)
    .setTitle(contest.title)
    .setDescription('Топ')
    .addFields(
      {
        name: '\u200B',
        value: `Роль ${role.name}`,
        inline: true,
      },
      {
        name: '\u200B',
        value: `Канал ${role.name}`,
        inline: true,
      },
    )
    .setTimestamp(contest.createdAt)
    .setFooter({
      text: 'CMNW',
      iconURL: 'https://i.imgur.com/OBDcu7K.png',
    });

export const contestStatsEmbed = (title: string) =>
  new EmbedBuilder()
    .setColor(0x0099ff)
    .setTitle(title)
    .setDescription('Топ')
    .setTimestamp(new Date())
    .setFooter({
      text: 'CMNW',
      iconURL: 'https://i.imgur.com/OBDcu7K.png',
    });
