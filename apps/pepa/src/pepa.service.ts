import Redis from 'ioredis';
import { REST } from '@discordjs/rest';
import { InjectRedis } from '@nestjs-modules/ioredis';
import { AmqpConnection } from '@golevelup/nestjs-rabbitmq';
import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { Keys, Profiles, Prompts } from '@cmnw/mongo';
import { Injectable, Logger, OnApplicationBootstrap } from '@nestjs/common';

import {
  ACTION_TRIGGER_FLAG,
  CHAT_ROLE_ENUM,
  ChatDto,
  chatQueue,
  getProfile,
  loadKey,
  MessageDto,
  messageQueue,
  PEPA_REACT_CHANCE,
  random,
} from '@cmnw/core';

import {
  ChannelType,
  Client,
  Collection,
  Events,
  GatewayIntentBits,
  Message,
  Partials,
  Snowflake,
} from 'discord.js';

@Injectable()
export class PepaService implements OnApplicationBootstrap {
  private readonly rest = new REST({ version: '10' });
  private readonly logger = new Logger(PepaService.name, {
    timestamp: true,
  });

  private client: Client;
  private pepaKey: Keys;
  private pepaProfile: Profiles;
  private pepaPrompt: Prompts;
  private messageStorage = new Collection<
    Snowflake,
    Collection<Snowflake, MessageDto>
  >();

  constructor(
    private readonly amqpConnection: AmqpConnection,
    @InjectRedis()
    private readonly redisService: Redis,
    @InjectModel(Keys.name)
    private readonly keysModel: Model<Keys>,
    @InjectModel(Prompts.name)
    private readonly promptsModel: Model<Prompts>,
    @InjectModel(Profiles.name)
    private readonly profilesModel: Model<Profiles>,
  ) {}
  async onApplicationBootstrap() {
    await this.loadBot();
    await this.bot();
  }

  private async loadBot(resetContext = false) {
    this.client = new Client({
      partials: [Partials.User, Partials.Channel, Partials.GuildMember],
      intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMembers,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.GuildPresences,
        GatewayIntentBits.MessageContent,
      ],
      presence: {
        status: 'online',
      },
    });

    if (resetContext) {
      await this.redisService.flushall();
      this.logger.warn(`resetContext set to ${resetContext}`);
    }

    this.pepaKey = await loadKey(this.keysModel, 'Pepa');
    this.pepaPrompt = await this.promptsModel.findOneAndUpdate<Prompts>({
      role: CHAT_ROLE_ENUM.SYSTEM,
    });

    await this.client.login(this.pepaKey.token);
    this.rest.setToken(this.pepaKey.token);
  }

  private async bot() {
    this.client.on(Events.ClientReady, async () => {
      this.logger.log(`Logged in as ${this.client.user.tag}!`);
      this.pepaProfile = await getProfile(
        this.logger,
        this.profilesModel,
        this.pepaKey,
        {
          userId: this.client.user.id,
          keyId: this.pepaKey._id,
          name: this.client.user.username,
          avatarUrl: this.client.user.avatarURL(),
        },
      );
    });

    this.client.on(Events.MessageCreate, async (message: Message<true>) => {
      try {
        const chatMessage = MessageDto.fromDiscordMessage(
          message,
          this.pepaKey,
        );

        const channelId = message.channel.id;
        const isChannelExists = this.messageStorage.has(channelId);
        const messageStorage = isChannelExists
          ? this.messageStorage.get(channelId)
          : new Collection<Snowflake, MessageDto>([
              [message.author.id, chatMessage],
            ]);

        if (!isChannelExists) {
          this.messageStorage.set(channelId, messageStorage);
        }

        const { isBot, isSelf, isGuild } = this.isIgnore(message, this.client);

        if (isSelf || isBot || !isGuild) return;

        const { content } = message;

        const isText = Boolean(content);
        const hasAttachment = Boolean(message.attachments.size);

        const { flag } = await this.rollDiceFullHouse({
          isText,
          hasAttachment,
        });
        // TODO what?
        await this.amqpConnection.publish<MessageDto>(
          messageQueue.name,
          'messages.all',
          chatMessage,
        );

        if (flag === ACTION_TRIGGER_FLAG.MESSAGE_REPLY) {
          await this.messageReply(message, channelId);
        }
      } catch (errorOrException) {
        this.logger.error(errorOrException);
      }
    });
  }

  async messageReply(message: Message, channelId: string) {
    const n = random(1, 7);
    if (n < 6) return;

    const messageCollection = this.messageStorage.get(channelId);
    const dialogFrom = ChatDto.fromMessages(
      messageCollection.last(n),
      this.pepaPrompt,
      this.client.user.id,
    );

    const response = await this.amqpConnection.request<string>({
      exchange: chatQueue.name,
      routingKey: 'v3',
      payload: dialogFrom,
      timeout: 60 * 1000,
    });

    await message.channel.send({ content: response });
  }

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
      const triggerChance = random(0, 100);

      if (isMedia && triggerChance > PEPA_REACT_CHANCE.IS_MEDIA) {
        return {
          flag: ACTION_TRIGGER_FLAG.MESSAGE_REPLY,
        };
      }

      if (
        !isText &&
        hasAttachment &&
        triggerChance > PEPA_REACT_CHANCE.ATTACHMENT_ONLY_EMOJI
      ) {
        return { flag: ACTION_TRIGGER_FLAG.EMOJI };
      }

      if (isMentioned && triggerChance > PEPA_REACT_CHANCE.IS_SOFT_MENTIONED) {
        return { flag: ACTION_TRIGGER_FLAG.MESSAGE_REPLY };
      }

      if (isText && triggerChance >= PEPA_REACT_CHANCE.TEXT_ONLY_EMOJI) {
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
}
