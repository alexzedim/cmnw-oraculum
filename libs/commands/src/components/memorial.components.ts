import { EmbedBuilder } from 'discord.js';

export const memorialBoardEmbed = (
  name: string,
  url: string,
  description: string,
  date: Date,
  avatar: string,
) =>
  new EmbedBuilder()
    .setColor(0x0099ff)
    .setTitle(name)
    .setURL(url)
    .setDescription(description)
    .setTimestamp(date)
    .setThumbnail(avatar)
    .setFooter({
      text: 'Managed & operated by CMNW',
      // TODO optional replace for github source
      iconURL: 'https://i.imgur.com/OBDcu7K.png',
    });
