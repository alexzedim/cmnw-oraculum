import { Events, GuildBan } from 'discord.js';
import { now } from '@cmnw/core/utils';

export class EventDto {
  channelId: string;

  userId: string;

  guildId: string;

  messageId: string;

  nameValue: string;

  oldValue: boolean | string | number;

  newValue: boolean | string | number;

  event: string;

  updatedAt: Date;

  createdAt: Date;

  static fromGuildBan(guildBan: GuildBan, event: Events): EventDto {
    const dto = new EventDto();

    const userId = guildBan.user.id;
    const guildId = guildBan.guild.id;
    const date = now();

    Object.assign(dto, {
      userId: userId,
      guildId: guildId,
      event: event,
      updatedAt: date,
      createdAt: date,
    });

    return dto;
  }
}
