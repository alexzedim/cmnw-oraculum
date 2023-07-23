import { Model } from 'mongoose';
import { Messages } from '@cmnw/mongo';
import { Logger } from '@nestjs/common';
import { EventDto, MessageDto } from '@cmnw/core/dto';
import { EMOJIS_EVENT_KEYS } from '@cmnw/core/const';

export const indexByMessage = async (
  model: Model<Messages>,
  logger: Logger,
  message: MessageDto,
) => {
  try {
    await model.findByIdAndUpdate(message.id, message, {
      upsert: true,
      new: true,
    });
  } catch (errorOrException) {
    logger.error(errorOrException);
  }
};

export const countEmojis = async (
  model: Model<Messages>,
  eventDto: EventDto,
) => {
  const isEmoji = EMOJIS_EVENT_KEYS.has(eventDto.event);
  if (!isEmoji) return;

  const counter = EMOJIS_EVENT_KEYS.get(eventDto.event);
  await model.findByIdAndUpdate(eventDto.messageId, {
    $inc: { emojisCount: counter },
  });
};
