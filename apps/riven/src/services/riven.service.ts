import Redis from 'ioredis';
import { REST } from '@discordjs/rest';
import { InjectRedis } from '@nestjs-modules/ioredis';
import { AmqpConnection, RabbitSubscribe } from '@golevelup/nestjs-rabbitmq';
import { DateTime } from 'luxon';
import { Interval } from '@nestjs/schedule';
import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { Keys } from '@cmnw/mongo';
import { Injectable, Logger, OnApplicationBootstrap } from '@nestjs/common';
import {
  messageEmbed,
  SlashCommand,
  votingNominationCommand,
} from '@cmnw/commands';

import {
  MessageDto,
  loadKey,
  waitForDelay,
  VotingCounter,
  messageQueue,
  chatQueue, ReplyV4Dto,
} from '@cmnw/core';

import {
  Client,
  Collection,
  Events,
  GatewayIntentBits,
  GuildMember,
  Message,
  Partials,
  Routes,
  Snowflake,
  TextChannel,
} from 'discord.js';

import { ChatService } from './chat.service';
import { StorageService } from './storage.service';
import { capitalizeFirstLetter } from 'normalize-text';

@Injectable()
export class RivenService implements OnApplicationBootstrap {
  private readonly logger = new Logger(RivenService.name, {
    timestamp: true,
  });
  private readonly rest = new REST({ version: '10' });

  private client: Client;
  private chatUser: Keys;
  private votingStorage = new Collection<string, VotingCounter>();
  private commandsMessage = new Collection<string, SlashCommand>();
  private messageStorage = new Collection<
    Snowflake,
    Collection<Snowflake, MessageDto>
  >();

  constructor(
    private storageService: StorageService,
    private chatService: ChatService,
    private readonly amqpConnection: AmqpConnection,
    @InjectRedis()
    private readonly redisService: Redis,
    @InjectModel(Keys.name)
    private readonly keysModel: Model<Keys>,
  ) {}
  async onApplicationBootstrap() {
    // await this.storageService.get();
    await this.loadBot();
    //await this.loadCommands();
    //await this.bot();
  }

  private async loadCommands(): Promise<void> {
    this.commandsMessage.set(
      votingNominationCommand.name,
      votingNominationCommand,
    );
    // this.commandsMessage.set(cryptoCommand.name, cryptoCommand);

    const commandsBody = [
      votingNominationCommand.slashCommand.toJSON(),
      // cryptoCommand.slashCommand.toJSON(),
    ];

    await this.rest.put(Routes.applicationCommands(this.client.user.id), {
      body: commandsBody,
    });
  }

  private async loadBot(resetContext = false) {
    const response = await this.amqpConnection.request<ReplyV4Dto>({
      exchange: chatQueue.name,
      routingKey: 'v4',
      payload: {
        prompt: { version: 4 },
        chatFlow: [
          {
            role: 'system',
            content:
              'Представь что ты зовут Фефеня, и что ты неформально общаешься в чате. Сегодня тебе надо разыграть среди участников дискорда приз котик дня.',
          },
          {
            role: 'user',
            content:
              'Придумай четыре или пять фраз которые покажут процесс как ты определишь кому достанется звание котик дня в дискорде.',
          },
        ],
      },
      timeout: 60 * 1000,
    });

    console.log(response);

    return;

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

    this.chatUser = await loadKey(this.keysModel, 'Riven');

    await this.client.login(this.chatUser.token);
    this.rest.setToken(this.chatUser.token);
  }

  @RabbitSubscribe({
    exchange: messageQueue.name,
    queue: messageQueue.name,
    routingKey: 'messages.all',
    createQueueIfNotExists: true,
  })
  private async putInQueue(message: MessageDto) {
    await waitForDelay(10);
    const channel = this.client.channels.cache.get(
      '1100433314101338202',
    ) as TextChannel;

    const embed = messageEmbed(message);
    await channel.send({ embeds: [embed] });
  }

  private async bot() {
    this.client.on(Events.ClientReady, async () => {
      this.logger.log(`Logged in as ${this.client.user.tag}!`);
    });

    this.client.on(Events.GuildMemberAdd, async (member: GuildMember) => {
      await this.renameGuildMember(member, false);
    });

    this.client.on(Events.GuildMemberUpdate, async (member: GuildMember) => {
      await this.renameGuildMember(member, true);
    });

    this.client.on(Events.MessageCreate, async (message: Message<true>) => {
      await this.renameGuildMember(message.member, true);
    });

    this.client.on(
      Events.InteractionCreate,
      async (interaction): Promise<void> => {
        const isChatInputCommand = interaction.isChatInputCommand();
        if (!isChatInputCommand) return;

        try {
          const command = this.commandsMessage.get(interaction.commandName);
          if (!command) return;

          await command.executeInteraction({
            interaction,
            models: {},
            redis: this.redisService,
            logger: this.logger,
            rabbit: this.amqpConnection,
          });
        } catch (errorException) {
          this.logger.error(errorException);
          await interaction.reply({
            content: 'There was an error while executing this command!',
            ephemeral: true,
          });
        }
      },
    );
  }

  async renameGuildMember(guildMember: GuildMember, isFromUpdate: boolean) {
    let username = guildMember.user.username;
    if (isFromUpdate) {
      const [splitName] = guildMember.displayName.split(' ');

      const cyrillic = splitName.replace(/[^a-zA-Z]/g, '').length;
      const latin = splitName.replace(/[^а-яА-Я]/g, '').length;

      latin >= cyrillic
        ? (username = username.replace(/[^а-яА-Я]/g, ''))
        : (username = username.replace(/[^a-zA-Z]/g, ''));

      username = splitName;
    }

    const displayName = capitalizeFirstLetter(username.toLowerCase());
    await guildMember.setNickname(displayName);
    this.logger.log(`User | ${username} => ${displayName}`);
  }

  @Interval(10_000)
  async eventManagement() {
    const now = DateTime.now().setZone('Europe/Moscow');
    // TODO check current event at a moment of time

    // TODO increase chance of inactivity for each period

    // TODO Redis Pepa inactivity flag value

    // TODO check chance
    // const questions = await this.chatService.answerQuestion();
  }
}
