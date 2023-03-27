import {
  Injectable,
  Logger,
  NotFoundException,
  OnApplicationBootstrap,
} from '@nestjs/common';
import { REST } from '@discordjs/rest';
import { Job, Queue } from 'bullmq';
import Redis from 'ioredis';
import { InjectRedis } from '@nestjs-modules/ioredis';
import { Whoami } from './commans';
import { BullQueueInject, BullWorker } from '@anchan828/nest-bullmq';
import { CoreUsersEntity } from '@cmnw/pg';
import {
  chatQueue,
  ISlashCommand,
  MessageJobInterface,
  MessageJobResInterface,
  randInBetweenInt,
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
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";

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
      throw new NotFoundException('Fefenya token not found!');

    this.pepaUser = pepaUserEntity;

    await this.client.login(this.pepaUser.token);
    this.rest.setToken(this.pepaUser.token);
  }

  private async bot() {
    this.client.on(Events.ClientReady, async () => {
      this.logger.log(`Logged in as ${this.client.user.tag}!`);
      await this.storage();
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
        // TODO update activity or ignore message

        this.dialog.push({
          role: 'user',
          content: message.content,
        });

        const engineIndex = randInBetweenInt(0, 1);

        this.chatEngine = this.chatEngineStorage[engineIndex];
        this.logger.debug(`Engine ${engineIndex} selected. REQUEST =>`);

        let reply: string;

        try {
          const { data: chatResponses } =
            await this.chatEngine.createChatCompletion({
              model: OPENAI_MODEL_ENGINE.ChatGPT_35,
              messages: this.dialog as any,
              temperature: 0.7, // randInBetweenFloat(0.5, 0.9, 1),
              max_tokens: 2048,
              // top_p: randInBetweenFloat(0.3, 0.5, 1),
              frequency_penalty: 0.0, // randInBetweenFloat(0.3, 0.6, 1),
              presence_penalty: randInBetweenFloat(-2.0, 2.0, 1),
            });

          if (
            !chatResponses ||
            !chatResponses.choices ||
            !chatResponses.choices.length
          ) {
            // TODO cover
            this.logger.error('No responses found');
            return;
          }

          const { content } = this.chatService.formatResponseReply(
            chatResponses.choices,
          );
          reply = content;

          this.dialog.push({
            role: 'assistant',
            content,
          });
        } catch (chatEngineError) {
          this.logger.error(
            `${chatEngineError.response.status} : ${chatEngineError.response.statusText}`,
          );

          reply = await this.chatService.triggerError();
        }

        await message.channel.send(reply);
        this.dialog.shift();
      } catch (e) {
        console.error(e);
      }
    });
  }
}
