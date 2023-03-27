import { REST } from '@discordjs/rest';
import { Queue } from 'bullmq';
import Redis from 'ioredis';
import { InjectRedis } from '@nestjs-modules/ioredis';
import { Whoami } from './commans';
import { BullQueueInject, BullWorker } from '@anchan828/nest-bullmq';
import { CoreUsersEntity } from '@cmnw/pg';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import {
  Injectable,
  Logger,
  NotFoundException,
  OnApplicationBootstrap,
} from '@nestjs/common';

import {
  chatQueue,
  ISlashCommand,
  MessageJobInterface,
  MessageJobResInterface,
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
@BullWorker({ queueName: chatQueue.name, options: chatQueue.workerOptions })
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
    @InjectRedis()
    private readonly redisService: Redis,
    @BullQueueInject(chatQueue.name)
    private readonly queue: Queue<MessageJobInterface, MessageJobResInterface>,
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
      if (message.channel.type !== ChannelType.GuildText || message.author.bot)
        return;
      try {
      } catch (e) {
        console.error(e);
      }
    });
  }
}
