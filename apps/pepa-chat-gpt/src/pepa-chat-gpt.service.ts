import Redis from 'ioredis';
import { REST } from '@discordjs/rest';
import { InjectRedis } from '@nestjs-modules/ioredis';
import { Whoami } from './commans';
import { CoreUsersEntity } from '@cmnw/pg';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ChatService } from './chat/chat.service';
import { AmqpConnection } from '@golevelup/nestjs-rabbitmq';
import { DateTime } from 'luxon';
import { Timeout } from '@nestjs/schedule';
import {
  Injectable,
  Logger,
  NotFoundException,
  OnApplicationBootstrap,
} from '@nestjs/common';

import {
  formatRedisKey,
  ISlashCommand,
  MessageChatPublish,
  ORACULUM_EXCHANGE,
  PEPA_CHAT_KEYS,
  ROUTING_KEY,
} from '@cmnw/shared';

import {
  ChannelType,
  Client,
  Collection,
  Events,
  GatewayIntentBits,
  Partials,
  Routes,
} from 'discord.js';

@Injectable()
export class PepaChatGptService implements OnApplicationBootstrap {
  private readonly logger = new Logger(PepaChatGptService.name, {
    timestamp: true,
  });
  private readonly rest = new REST({ version: '10' });
  private client: Client;
  private pepaUser: CoreUsersEntity;
  private commandsMessage: Collection<string, ISlashCommand> = new Collection();
  private commandSlash = [];

  constructor(
    private chatService: ChatService,
    private readonly amqpConnection: AmqpConnection,
    @InjectRedis()
    private readonly redisService: Redis,
    @InjectRepository(CoreUsersEntity)
    private readonly coreUsersRepository: Repository<CoreUsersEntity>,
  ) {}
  async onApplicationBootstrap() {
    await this.loadBot();

    await this.loadCommands();

    await this.bot();
  }

  private async loadCommands(): Promise<void> {
    this.commandsMessage.set(Whoami.name, Whoami);
    this.commandSlash.push(Whoami.slashCommand.toJSON());

    await this.rest.put(Routes.applicationCommands(this.client.user.id), {
      body: this.commandSlash,
    });
  }

  private async loadBot(resetContext = false) {
    this.client = new Client({
      partials: [Partials.User, Partials.Channel, Partials.GuildMember],
      intents: [
        GatewayIntentBits.Guilds,
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

    const pepaUserEntity = await this.coreUsersRepository.findOneBy({
      name: 'PepaChatGpt',
    });

    if (!pepaUserEntity) throw new NotFoundException('Pepa not found!');

    if (!pepaUserEntity.token)
      throw new NotFoundException('Pepa token not found!');

    this.pepaUser = pepaUserEntity;

    await this.client.login(this.pepaUser.token);
    this.rest.setToken(this.pepaUser.token);
  }

  private async bot() {
    this.client.on(Events.ClientReady, async () => {
      this.logger.log(`Logged in as ${this.client.user.tag}!`);
      // await this.storage();
    });

    this.client.on(
      Events.InteractionCreate,
      async (interaction): Promise<void> => {
        if (!interaction.isCommand()) return;
        try {
          const command = this.commandsMessage.get(interaction.commandName);
          if (!command) return;

          await command.executeInteraction({
            interaction,
            logger: this.logger,
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
    /**
     * @description Doesn't trigger itself & other bots as-well.
     */
    this.client.on(Events.MessageCreate, async (message) => {
      let isIgnore: boolean;
      let isMentioned: boolean;

      try {
        isIgnore = message.author.bot;
        if (isIgnore) return;

        isIgnore = message.channel.type !== ChannelType.GuildText;
        if (isIgnore) return;

        isIgnore = await this.chatService.isIgnore();
        if (isIgnore) return;

        await this.chatService.updateLastActiveMessage(message.channelId);

        const { id, author, reference, content, channel, guild } = message;
        const key = formatRedisKey(PEPA_CHAT_KEYS.MENTIONED, 'PEPA');

        isMentioned = await this.chatService.isMentioned(
          message.mentions,
          message.mentions.users,
          this.client.user.id,
          content,
        );

        isMentioned = Boolean(await this.redisService.exists(key));

        const isText = Boolean(content);
        const hasAttachment = Boolean(message.attachments.size);

        const { flag } = await this.chatService.rollDiceFullHouse({
          isText,
          hasAttachment,
          isMentioned,
        });

        if (ROUTING_KEY.includes(flag)) {
          await this.amqpConnection.publish<MessageChatPublish>(
            ORACULUM_EXCHANGE,
            'message.chat.eye.pepa',
            {
              id,
              channel,
              guild,
              author,
              content,
              reference,
            },
          );
        }
      } catch (errorOrException) {
        this.logger.error(errorOrException);
      }
    });
  }

  @Timeout(100_000)
  async eventManagement() {
    const now = DateTime.now().setZone('Europe/Moscow');
    // TODO check current event at a moment of time

    // TODO increase chance of inactivity for each period

    // TODO Redis Pepa inactivity flag value

    // TODO check chance
  }
}
