import { Injectable, Logger, OnApplicationBootstrap } from '@nestjs/common';
import Redis from 'ioredis';
import {
  BaseGuildTextChannel,
  Client,
  Collection,
  Events,
  GatewayIntentBits,
  Partials,
  REST,
} from 'discord.js';
import { InjectS3, S3 } from 'nestjs-s3';
import { InjectRedis } from '@nestjs-modules/ioredis';
import { yandexConfig } from '@cmnw/config';
import { HttpService } from '@nestjs/axios';
import { wait } from '@cmnw/core';
import { AmqpConnection } from '@golevelup/nestjs-rabbitmq';
import { InjectModel } from '@nestjs/mongoose';
import { Prompts } from '@cmnw/mongo';
import { Model } from 'mongoose';

@Injectable()
export class TestService implements OnApplicationBootstrap {
  private client: Client;
  private readonly rest = new REST({ version: '10' });
  private commands: Collection<string, any> = new Collection();
  private modals: Collection<string, any> = new Collection();
  private readonly logger = new Logger(TestService.name, {
    timestamp: true,
  });

  constructor(
    private readonly httpService: HttpService,
    private readonly amqpConnection: AmqpConnection,
    @InjectS3() private readonly s3: S3,
    @InjectRedis()
    private readonly redisService: Redis,
    @InjectModel(Prompts.name)
    private readonly promptsModel: Model<Prompts>,
  ) {}

  async onApplicationBootstrap(): Promise<void> {
    // await this.generateMessage();
    // await this.loadBot();
    // await this.loadCommands();
    // await this.bot();
  }

  public async generateMessage() {
    try {
      const body = {
        modelUri: 'gpt://b1gc0o2ap8q1lnutfvn8/yandexgpt-lite',
        completionOptions: {
          stream: false,
          temperature: 0.1,
          maxTokens: '1000',
        },
        messages: [
          {
            role: 'system',
            text: 'Переведи текст',
          },
          {
            role: 'user',
            text: 'To be, or not to be: that is the question.',
          },
        ],
      };

      const { data } = await this.httpService.axiosRef({
        method: 'POST',
        url: 'https://llm.api.cloud.yandex.net/foundationModels/v1/completion',
        headers: {
          Authorization: `Api-Key ${yandexConfig.token}`,
          'Content-Type': 'application/json',
          // 'x-folder-id': 1,
        },
        data: JSON.stringify(body),
      });

      console.log(data.result.alternatives);
    } catch (errorOrException) {
      this.logger.error(errorOrException);
      // TODO reply placeholder
    }
  }

  public async test() {
    return 1;
  }

  private async loadBot() {
    this.client = new Client({
      partials: [
        Partials.User,
        Partials.Channel,
        Partials.GuildMember,
        Partials.Message,
      ],
      intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildModeration,
        GatewayIntentBits.GuildMembers,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.GuildPresences,
        GatewayIntentBits.GuildMessageReactions,
        GatewayIntentBits.MessageContent,
      ],
      presence: {
        status: 'online',
      },
    });

    const token =
      '';

    await this.client.login(token);
    this.rest.setToken(token);
  }

  private async loadCommands(): Promise<void> {
    this.logger.log('Commands updated');
  }

  async bot(): Promise<void> {
    try {
      this.client.on(Events.ClientReady, async () => {
        this.logger.log(`${this.client.user.tag} signals ready!`);
        const channel = this.client.channels.cache.get('1016399579417149523');

        const lyricsOriginal = [
          'а слова мои всегда просты',
          'напрасно себя ты сомненьями мучаешь мучаешь',
          'ты, и ты, и только ты',
          'и новая муза, новая муза, новая',
        ];

        const lyricsS = [
          'не упрекай меня, постой',
          'что я сегодня не с тобой',
          'что я опять иду ....',
          'и не удерживай меня',
          'прожить без творчества и дня',
          'оно во мне стучится белой, белой птицею',
        ];

        const lyrics = [
          'но ты обиделся совсем',
          'а может просто больше всех',
          'себя ты любишь',
          'ну а тогда причем тут музы, а?',
          'а ты подумай обо мне',
          'ведь без тебя мне жизни нет',
          'меня не хочешь ты понять',
          'ну почему ты так?',
        ];

        const lyricsFormatted = [
          'а',
          'слова мои',
          'всегда просты',
          'напрасно, себя ты, сомненьями мучаешь',
          'му, ча, ешь',
          '==',
          'ты, и ты, и только, ты',
          'и-новая-муза, новая муза, н о в а я',
          '====',
          'но ты обиделся, совсем',
          '=',
          'а, может просто, больше всех',
          '=',
          'себя люблю я, но, тогда',
          '=',
          'причем тут музы, а?',
          '==',
          'а',
          'ты подумай',
          'обо мне',
          '=',
          'ведь, без тебя, мне жизни нет',
          '=',
          'меня не хочешь ты понять',
          '=',
          'ну, почему ты, так?',
          '==',
          'а, слова мои, всегда просты',
          'напрасно, себя ты, сомненьями мучаешь',
          'му, ча, ешь',
          '==',
          'ты, и ты, и только, ты',
          'и-новая-муза, новая муза, н о в а я',
        ];

        for (const lyricsRow of lyrics) {
          const rowArray = lyricsRow.split(' ');
          const length = rowArray.length;

          let to = 0;
          let spaces = 1;
          let currentString;

          for (let itx = 1; itx < length; itx++) {
            const from = to;
            to += itx;

            const isEnd = to >= length;
            const rowString = rowArray.slice(from, to);
            if (isEnd) {
              const lastWord = Array.from(rowString.pop()).join('-');
              rowString.push(lastWord);
            }

            if (spaces) {
              rowString.unshift(Array(spaces).join('⠀'));
            }

            spaces = +rowString.join(' ').length;
            currentString = rowString.join(' ');

            console.log(currentString);

            await (channel as BaseGuildTextChannel).send(currentString);
            await (channel as BaseGuildTextChannel).sendTyping();
            await wait(1);

            if (isEnd) break;
          }
          await wait(1);
        }
      });

      this.client.on(Events.InteractionCreate, async (interaction) => {
        if (!interaction.isModalSubmit()) return;
        try {
          const modal = this.modals.get(interaction.customId);
          if (!modal) return;

          await modal.executeInteraction({
            interaction,
            models: {},
            // redis: this.redisService,
            logger: this.logger,
            // rabbit: this.amqpConnection,
          });
        } catch (errorException) {
          this.logger.error(errorException);
          await interaction.reply({
            content: 'There was an error while executing this command!',
            ephemeral: true,
          });
        }
      });

      this.client.on(
        Events.InteractionCreate,
        async (interaction): Promise<void> => {
          const isChatInputCommand = interaction.isChatInputCommand();
          if (!isChatInputCommand) return;

          try {
            const command = this.commands.get(interaction.commandName);
            if (!command) return;

            await command.executeInteraction({
              interaction,
              models: {},
              // redis: this.redisService,
              logger: this.logger,
              // rabbit: this.amqpConnection,
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
    } catch (errorOrException) {
      this.logger.error(errorOrException);
    }
  }
}
