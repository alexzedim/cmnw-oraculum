import { Injectable, Logger } from '@nestjs/common';
import { InjectRedis } from '@nestjs-modules/ioredis';
import { Client, Message } from 'discord.js';
import Redis from 'ioredis';
import {
  formatRedisKey,
  PEPA_STORAGE_KEYS,
  PEPA_TRIGGER_FLAG,
  randInBetweenFloat,
  cryptoRandomIntBetween,
  PEPA_ROLL_CHANCE,
} from '@cmnw/shared';

@Injectable()
export class ChatService {
  private readonly logger = new Logger(ChatService.name, { timestamp: true });
  constructor(
    @InjectRedis()
    private readonly redisService: Redis,
  ) {}

  async chatReaction(
    client: Client,
    message: Message,
    min: number,
    max: number,
  ) {
    const anchorRandomElement = cryptoRandomIntBetween(min, max);
    const rangeAnchorElement = cryptoRandomIntBetween(min, 4);
    const emojiPepeArrayId = await this.redisService.lrange(
      formatRedisKey(PEPA_STORAGE_KEYS.EMOJIS, 'PEPA'),
      anchorRandomElement - rangeAnchorElement,
      anchorRandomElement,
    );
    for (const emojiId of emojiPepeArrayId) {
      const emoji = await client.emojis.cache.get(emojiId);
      await message.react(emoji);
    }
  }
  /**
   * @description This is vegas, baby
   * @description Don't try tp understand it@feel it
   */
  async rollDiceFullHouse({
    isText = false,
    isMentioned = false,
    isMedia = false,
    isTest = false,
    hasAttachment = false,
  }) {
    if (isTest) {
      return { flag: PEPA_TRIGGER_FLAG.TEST, context: `Привет, я Пепа` };
    }

    try {
      const triggerChance = cryptoRandomIntBetween(0, 100);

      if (isMedia && triggerChance > PEPA_ROLL_CHANCE.IS_MEDIA) {
        return {
          flag: PEPA_TRIGGER_FLAG.POST_MEME,
        };
      }

      if (
        !isText &&
        hasAttachment &&
        triggerChance > PEPA_ROLL_CHANCE.ATTACHMENT_ONLY_EMOJI
      ) {
        return { flag: PEPA_TRIGGER_FLAG.EMOJI };
      }

      if (
        (isText && triggerChance <= PEPA_ROLL_CHANCE.TEXT_ONLY_REPLY) ||
        isMentioned
      ) {
        return { flag: PEPA_TRIGGER_FLAG.MESSAGE };
      }

      if (isText && triggerChance >= PEPA_ROLL_CHANCE.TEXT_ONLY_EMOJI) {
        return { flag: PEPA_TRIGGER_FLAG.EMOJI };
      }

      return { flag: PEPA_TRIGGER_FLAG.EMPTY };
    } catch (errorException) {
      this.logger.error(errorException);
      return { flag: PEPA_TRIGGER_FLAG.EMPTY };
    }
  }
}
