import { EmbedBuilder } from 'discord.js';

export const contestEmbed = (title: string) =>
  new EmbedBuilder()
    .setColor(0x0099ff)
    .setTitle(title)
    .setDescription('Топ')
    .setTimestamp(new Date())
    .setFooter({
      text: 'CMNW',
      iconURL: 'https://i.imgur.com/OBDcu7K.png',
    });
