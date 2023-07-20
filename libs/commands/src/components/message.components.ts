import { EmbedBuilder } from 'discord.js';
import { MessageDto } from '@cmnw/core';

export const messageEmbed = (message: MessageDto) =>
  new EmbedBuilder()
    .setTitle(message.username)
    .setDescription(message.text)
    .setColor('#2b2d31');
