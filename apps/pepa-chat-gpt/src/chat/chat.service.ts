import Redis from 'ioredis';
import { Injectable, Logger } from '@nestjs/common';
import { InjectRedis } from '@nestjs-modules/ioredis';
import { Client, Collection, Message, MessageMentions, User } from 'discord.js';
import { InjectRepository } from '@nestjs/typeorm';
import { PepaQuestionsEntity } from '@cmnw/pg';
import { Repository } from 'typeorm';
import {
  cryptoRandomIntBetween,
  formatRedisKey,
  PEPA_CHAT_KEYS,
  PEPA_PERSONALITY,
  PEPA_ROLL_CHANCE,
  PEPA_STORAGE_KEYS,
  PEPA_TRIGGER_FLAG,
} from '@cmnw/shared';

@Injectable()
export class ChatService {
  private readonly logger = new Logger(ChatService.name, { timestamp: true });
  constructor(
    @InjectRedis()
    private readonly redisService: Redis,
    @InjectRepository(PepaQuestionsEntity)
    private readonly pepaQuestionsRepository: Repository<PepaQuestionsEntity>,
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

      if (isMentioned) {
        return { flag: PEPA_TRIGGER_FLAG.MESSAGE_REPLY };
      }

      if (isText && triggerChance <= PEPA_ROLL_CHANCE.TEXT_ONLY_PROVOKE) {
        return { flag: PEPA_TRIGGER_FLAG.MESSAGE_PROVOKE };
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

  public async isIgnore(): Promise<boolean> {
    const key = formatRedisKey(PEPA_CHAT_KEYS.FULL_TILT_IGNORE, 'PEPA');
    const ignoreMe = Boolean(await this.redisService.exists(key));
    if (ignoreMe) {
      const ttl = await this.redisService.ttl(key);
      this.logger.debug(`Pepa will ignore everything for ${ttl} more seconds`);
    }
    return ignoreMe;
  }

  public async isQuestion(
    question: string,
    userId: string,
    username: string,
    channelId: string,
  ) {
    try {
      const questionMarks = question.match(/\?/g).length;
      if (!questionMarks) {
        return false;
      }

      const isCertain = question.endsWith('?');

      const questionEntity = this.pepaQuestionsRepository.create({
        userId,
        username,
        question,
        questionMarks,
        isCertain,
        channelId,
        isAnswered: false,
      });

      await this.pepaQuestionsRepository.save(questionEntity);

      return true;
    } catch (errorOrException) {
      this.logger.error(errorOrException);
      return false;
    }
  }

  /**
   * TODO add timeout expire if someone else answer that question
   */
  public async answerQuestion() {
    try {
      const questionsToAnswer = await this.pepaQuestionsRepository.find({
        where: { isAnswered: false },
      });

      if (!questionsToAnswer || !questionsToAnswer.length) {
        return [];
      }

      await this.pepaQuestionsRepository.update(
        { isAnswered: false },
        { isAnswered: true },
      );

      return questionsToAnswer.map((questionEntity) => ({
        ...questionEntity,
        personality:
          questionEntity.questionMarks > 1 || questionEntity.isCertain
            ? [PEPA_PERSONALITY.QUESTION]
            : [PEPA_PERSONALITY.SUBMISSION],
      }));
    } catch (errorOrException) {
      this.logger.error(errorOrException);
    }
  }

  public async triggerIgnore(): Promise<void> {
    const timeout = cryptoRandomIntBetween(30, 600);
    const key = formatRedisKey(PEPA_CHAT_KEYS.FULL_TILT_IGNORE, 'PEPA');
    await this.redisService.set(key, 1, 'EX', timeout);
    this.logger.debug(`Pepa will ignore everything for ${timeout} seconds`);
    // TODO random
    // return corpus.backoff.random();
  }

  public async updateLastActiveMessage(channelId: string) {
    const unixNow = Date.now();
    const key = formatRedisKey(
      `${PEPA_CHAT_KEYS.LAST_MESSAGE_AT}:${channelId}`,
      'PEPA',
    );
    await this.redisService.set(key, unixNow);
    this.logger.debug(`Last message timestamp updated for ${unixNow}`);
  }

  public async isMentioned(
    mentions: MessageMentions<boolean>,
    mentionUsers: Collection<string, User>,
    clientId: string,
    content: string,
  ): Promise<boolean> {
    const regex = new RegExp('^пеп');
    const isMentioned =
      mentions && mentionUsers.size
        ? mentionUsers.has(clientId)
        : content
            .split(' ')
            .filter(Boolean)
            .some((s) => regex.test(s.toLowerCase()));

    if (isMentioned) {
      const key = formatRedisKey(PEPA_CHAT_KEYS.MENTIONED, 'PEPA');
      await this.redisService.set(key, 1, 'EX', cryptoRandomIntBetween(7, 10));
    }

    return isMentioned;
  }
}
