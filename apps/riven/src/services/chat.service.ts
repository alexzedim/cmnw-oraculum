import Redis from 'ioredis';
import { Injectable, Logger } from '@nestjs/common';
import { InjectRedis } from '@nestjs-modules/ioredis';
import {
  ChannelType,
  Client,
  Collection,
  Message,
  MessageMentions,
  User,
} from 'discord.js';

import {
  randomMixMax,
  formatRedisKey,
  CHAT_KEYS,
  PEPA_ROLL_CHANCE,
  STORAGE_KEYS,
  ACTION_TRIGGER_FLAG,
} from '@cmnw/core';
import { Prompts } from '@cmnw/mongo';

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
    const anchorRandomElement = randomMixMax(min, max);
    const rangeAnchorElement = randomMixMax(min, 4);
    const emojiPepeArrayId = await this.redisService.lrange(
      formatRedisKey(STORAGE_KEYS.EMOJIS, 'PEPA'),
      anchorRandomElement - rangeAnchorElement,
      anchorRandomElement,
    );
    for (const emojiId of emojiPepeArrayId) {
      const emoji = client.emojis.cache.get(emojiId);
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
      return { flag: ACTION_TRIGGER_FLAG.TEST, context: `Привет, я Пепа` };
    }

    try {
      const triggerChance = randomMixMax(0, 100);

      if (isMedia && triggerChance > PEPA_ROLL_CHANCE.IS_MEDIA) {
        return {
          flag: ACTION_TRIGGER_FLAG.POST_MEME,
        };
      }

      if (
        !isText &&
        hasAttachment &&
        triggerChance > PEPA_ROLL_CHANCE.ATTACHMENT_ONLY_EMOJI
      ) {
        return { flag: ACTION_TRIGGER_FLAG.EMOJI };
      }

      if (isMentioned) {
        return { flag: ACTION_TRIGGER_FLAG.MESSAGE_REPLY };
      }

      if (isText && triggerChance <= PEPA_ROLL_CHANCE.TEXT_ONLY_PROVOKE) {
        return { flag: ACTION_TRIGGER_FLAG.MESSAGE_PROVOKE };
      }

      if (isText && triggerChance >= PEPA_ROLL_CHANCE.TEXT_ONLY_EMOJI) {
        return { flag: ACTION_TRIGGER_FLAG.EMOJI };
      }

      return { flag: ACTION_TRIGGER_FLAG.EMPTY };
    } catch (errorException) {
      this.logger.error(errorException);
      return { flag: ACTION_TRIGGER_FLAG.EMPTY };
    }
  }

  public isIgnore(message: Message, client: Client) {
    const isSelf = message.author.id === client.user.id;
    const isBot = message.author.bot;
    const isGuild = message.channel.type !== ChannelType.GuildText;

    return { isSelf, isBot, isGuild };
  }

  public async isIgnoreTriggered(username: string): Promise<boolean> {
    const key = formatRedisKey(CHAT_KEYS.FULL_TILT_IGNORE, 'CHAT');
    const ignoreMe = Boolean(await this.redisService.exists(key));
    if (ignoreMe) {
      const ttl = await this.redisService.ttl(key);
      this.logger.debug(
        `${username} will ignore everything for ${ttl} more seconds`,
      );
    }

    return ignoreMe;
  }

  public async isQuestion(message: Message) {
    try {
      const isMultipleQuestions = (message.content.match(/\?/g) || []).length;
      const isCertainQuestion = message.content.endsWith('?');

      return { isMultipleQuestions, isCertainQuestion };
    } catch (errorOrException) {
      this.logger.error(errorOrException);
      return { isMultipleQuestions: false, isCertainQuestion: false };
    }
  }

  public async setTriggerIgnore(): Promise<void> {
    const timeout = randomMixMax(30, 600);
    const key = formatRedisKey(CHAT_KEYS.FULL_TILT_IGNORE, 'CHAT');
    await this.redisService.set(key, 1, 'EX', timeout);
    this.logger.debug(`Pepa will ignore everything for ${timeout} seconds`);
  }

  public async setChannelLastActive(channelId: string) {
    const unixNow = Date.now();
    const key = formatRedisKey(
      `${CHAT_KEYS.LAST_MESSAGE_AT}:${channelId}`,
      'CHAT',
    );
    await this.redisService.set(key, unixNow);
    this.logger.debug(`Last message timestamp updated for ${unixNow}`);
  }

  public async isUserMentioned(
    promptModel: Prompts,
    mentions: MessageMentions<boolean>,
    mentionUsers: Collection<string, User>,
    clientId: string,
    content: string,
  ): Promise<boolean> {
    const user = mentionUsers.get('1');
    const precursor = user.username.toLowerCase().slice(0, 3);
    const regex = new RegExp(`^${precursor}`);
    const isMentioned =
      mentions && mentionUsers.size
        ? mentionUsers.has(clientId)
        : content
            .split(' ')
            .filter(Boolean)
            .some((s) => regex.test(s.toLowerCase()));

    if (isMentioned) {
      const key = formatRedisKey(CHAT_KEYS.MENTIONED, 'PEPA');
      await this.redisService.set(key, 1, 'EX', randomMixMax(7, 10));
    }

    return isMentioned;
  }
}
