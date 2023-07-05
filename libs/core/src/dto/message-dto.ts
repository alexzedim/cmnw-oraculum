import { Message, SnowflakeUtil } from 'discord.js';
import { Keys } from '@cmnw/mongo';
import { DateTime } from 'luxon';

export class MessageDto {
  id: string;

  userId: string;

  username: string;

  guildId: string;

  guildName: string;

  channelId: string;

  channelName: string;

  channelType: number;

  referenceMessageId?: string;

  referenceChannelId?: string;

  referenceGuildId?: string;

  text: string;

  length: number;

  scannedBy: string;

  scannedAt: Date;

  createdAt: Date;

  static fromDiscordMessage(
    message: Message<true>,
    chatUser: Keys,
  ): MessageDto {
    const dto = new MessageDto();
    const scannedAt = new Date();
    const createdAt = DateTime.fromMillis(
      SnowflakeUtil.timestampFrom(message.id),
    ).toJSDate();

    Object.assign(dto, {
      id: message.id,
      username: message.author.username,
      userId: message.author.id,
      channelId: message.channel.id,
      channelName: message.channel.name,
      channelType: message.channel.type,
      text: message.content,
      length: message.content.length,
      guildId: message.guild.id,
      guildName: message.guild.name,
      scannedBy: chatUser.id,
      referenceMessageId: message.reference
        ? message.reference.messageId
        : undefined,
      referenceChannelId: message.reference
        ? message.reference.channelId
        : undefined,
      referenceGuildId: message.reference
        ? message.reference.guildId
        : undefined,
      scannedAt,
      createdAt,
    });

    return dto;
  }
}
