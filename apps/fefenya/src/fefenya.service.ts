import { Injectable, Logger, OnApplicationBootstrap } from '@nestjs/common';
import { AmqpConnection } from '@golevelup/nestjs-rabbitmq';
import { from, lastValueFrom, mergeMap } from 'rxjs';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Cron, CronExpression } from '@nestjs/schedule';
import { InjectRedis } from '@nestjs-modules/ioredis';
import Redis from 'ioredis';
import {
  SlashCommand,
  contestStatsCommand,
  contestStartCommand,
  contestBindCommand,
} from '@cmnw/commands';

import { Contests, Fefenya, Keys, Profiles, Prompts } from '@cmnw/mongo';

import {
  CHAT_ROLE_ENUM,
  ChatDto,
  chatQueue,
  FEFENYA_GENERATIVE_PROMPTS,
  GENDER_ENUM,
  getProfile,
  getSystemPrompt,
  indexFefenyas,
  loadKey,
  PROVIDER_KEYS,
  prettyContestReply,
  EVENT_PROMPT_ENUM,
  random,
  resetContestByGuildId,
  setContestUserActive,
  TAGS_ENUM,
  ReplyDto,
} from '@cmnw/core';

import {
  Client,
  Collection,
  Events,
  GatewayIntentBits,
  Guild,
  Partials,
  REST,
  Routes,
} from 'discord.js';

@Injectable()
export class FefenyaService implements OnApplicationBootstrap {
  private readonly logger = new Logger(FefenyaService.name, {
    timestamp: true,
  });
  private client: Client;
  private fefenyaKey: Keys;
  private fefenyaProfile: Profiles;
  private fefenyaLocalMessage: Collection<string, string> = new Collection();
  private commandsMessage: Collection<string, SlashCommand> = new Collection();
  private readonly rest = new REST({ version: '10' });

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
    @InjectModel(Fefenya.name)
    private readonly fefenyasModel: Model<Fefenya>,
    @InjectModel(Contests.name)
    private readonly contestsModel: Model<Contests>,
  ) {}

  async onApplicationBootstrap(): Promise<void> {
    try {
      await this.loadFefenya();
      await this.loadCommands();
      await this.loadDialog();
      await this.loadFefenyas();

      await this.bot();
    } catch (errorOrException) {
      this.logger.error(`Application: ${errorOrException}`);
    }
  }

  private async loadFefenya(): Promise<void> {
    try {
      this.client = new Client({
        partials: [Partials.User, Partials.Channel, Partials.GuildMember],
        intents: [
          GatewayIntentBits.Guilds,
          GatewayIntentBits.GuildMessages,
          GatewayIntentBits.GuildPresences,
          GatewayIntentBits.MessageContent,
          GatewayIntentBits.GuildMembers,
        ],
        presence: {
          status: 'online',
        },
      });

      this.fefenyaKey = await loadKey(this.keysModel, TAGS_ENUM.FEFENYA, true);

      await this.client.login(this.fefenyaKey.token);
      this.rest.setToken(this.fefenyaKey.token);

      this.fefenyaProfile = await getProfile(
        this.logger,
        this.profilesModel,
        this.fefenyaKey,
        {
          codename: 'Fefenya',
          keyId: this.fefenyaKey._id,
          userId: this.client.user.id,
          username: this.client.user.username,
          avatarUrl: this.client.user.avatarURL(),
          gender: GENDER_ENUM.F,
        },
      );
    } catch (errorOrException) {
      this.logger.error(`loadFefenya: ${errorOrException}`);
    }
  }

  private async loadCommands(): Promise<void> {
    this.commandsMessage.set(contestBindCommand.name, contestBindCommand);
    this.commandsMessage.set(contestStatsCommand.name, contestStatsCommand);
    this.commandsMessage.set(contestStartCommand.name, contestStartCommand);

    await this.rest.put(Routes.applicationCommands(this.client.user.id), {
      body: [
        contestStartCommand.slashCommand.toJSON(),
        contestStatsCommand.slashCommand.toJSON(),
        contestBindCommand.slashCommand.toJSON(),
      ],
    });

    this.logger.log('Commands updated');
  }

  @Cron(CronExpression.EVERY_30_MINUTES_BETWEEN_10AM_AND_7PM)
  private async loadFefenyas() {
    await lastValueFrom(
      from(this.client.guilds.cache.values()).pipe(
        mergeMap(async (guild) => await this.flow(guild), 5),
      ),
    );
  }

  async flow(guild: Guild) {
    try {
      const chance50 = random(0, 1);
      if (chance50 > 0) return;

      await resetContestByGuildId(this.fefenyasModel, guild.id);

      const isBig = guild.memberCount > 1000;
      if (isBig) return;

      // TODO for large servers pick random index
      const guildMembers = guild.members.cache.values();
      await lastValueFrom(
        from(guildMembers).pipe(
          mergeMap(async (member) => {
            const isBot = member.user.bot;
            if (isBot) return;

            await setContestUserActive(
              this.fefenyasModel,
              member.id,
              member.displayName,
              guild.id,
            );
          }),
        ),
      );

      // await this.gotdContestFlow(guild.id);
    } catch (errorException) {
      this.logger.error(errorException);
    }
  }

  async bot(): Promise<void> {
    try {
      this.client.on(Events.ClientReady, async () => {
        this.logger.log(`Logged in as ${this.client.user.tag}!`);
      });

      this.client.on(Events.GuildCreate, async (guild): Promise<void> => {
        try {
          // TODO highly questionable
          const guildMembers = guild.members.cache.values();
          for (const guildMember of guildMembers) {
            const isUserBot = guildMember.user.bot;
            if (isUserBot) return;
            await indexFefenyas(this.fefenyasModel, guildMember);
          }
        } catch (errorException) {
          this.logger.error(errorException);
        }
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
              models: {
                fefenyaModel: this.fefenyasModel,
                promptsModel: this.promptsModel,
                contestModel: this.contestsModel,
              },
              redis: this.redisService,
              logger: this.logger,
              rabbit: this.amqpConnection,
            });
          } catch (errorException) {
            this.logger.error(errorException);
            await interaction.reply({
              content: `С командой ${interaction.commandName} что-то не так.`,
              ephemeral: true,
            });
          }
        },
      );
    } catch (errorOrException) {
      this.logger.error(`Fefenya: ${errorOrException}`);
    }
  }

  // TODO refactor
  async loadDialog() {
    const dialogPrompts: Array<Prompts> = [];
    const itx = random(0, 1);
    const profileName = ['Efhenya', 'Fefenya'][itx];
    const control = 20;

    const systemCorePrompt = await getSystemPrompt(
      this.promptsModel,
      profileName,
    );

    for (const fefenyaPrompt of FEFENYA_GENERATIVE_PROMPTS) {
      const prompt = await this.promptsModel.findOneAndUpdate<Prompts>(
        {
          isGenerated: false,
          onEvent: fefenyaPrompt.onEvent,
          role: CHAT_ROLE_ENUM.USER,
        },
        fefenyaPrompt,
        {
          upsert: true,
          new: true,
        },
      );

      const countGeneratedPrompts = await this.promptsModel.count({
        onEvent: fefenyaPrompt.onEvent,
        role: CHAT_ROLE_ENUM.ASSISTANT,
        isGenerated: true,
      });

      const isGeneratedPromptExists = countGeneratedPrompts >= control;
      if (isGeneratedPromptExists) {
        this.logger.log(
          `Messages for ${fefenyaPrompt.onEvent} :: ${countGeneratedPrompts} >= ${control} :: ${isGeneratedPromptExists}`,
        );
        continue;
      }

      const chatFlow = ChatDto.fromPrompts([systemCorePrompt, prompt]);
      const response = await this.amqpConnection.request<ReplyDto>({
        exchange: chatQueue.name,
        routingKey: 'v4',
        payload: chatFlow,
        timeout: 60 * 1000,
      });

      const isContest = fefenyaPrompt.type === EVENT_PROMPT_ENUM.CONTEST;

      const prompts = isContest
        ? prettyContestReply(response.reply).map(
            (text, i) =>
              new this.promptsModel({
                profileId: this.fefenyaProfile._id,
                event: fefenyaPrompt.onEvent,
                type: fefenyaPrompt.type,
                text,
                role: CHAT_ROLE_ENUM.ASSISTANT,
                isGenerated: true,
                version: 4,
                position: i + 1,
                tags: fefenyaPrompt.tags,
                model: PROVIDER_KEYS.ChatGPT_4,
              }),
          )
        : [
            new this.promptsModel({
              profileId: this.fefenyaProfile._id,
              event: fefenyaPrompt.onEvent,
              type: fefenyaPrompt.type,
              text: response,
              role: CHAT_ROLE_ENUM.ASSISTANT,
              isGenerated: true,
              version: 4,
              tags: fefenyaPrompt.tags,
              model: PROVIDER_KEYS.ChatGPT_4,
            }),
          ];

      dialogPrompts.push(...prompts);

      this.logger.log(`Generated ${fefenyaPrompt.type} reply`);
    }
    await this.promptsModel.insertMany(dialogPrompts);
    this.logger.log(`Prompts has been inserted to collection`);
  }

  @Cron(CronExpression.EVERY_30_MINUTES_BETWEEN_10AM_AND_7PM)
  private async trophyContestFlow() {
    const guilds = this.client.guilds.cache.values();
    await lastValueFrom(
      from(guilds).pipe(
        mergeMap(async (guild) => {
          try {
            await resetContestByGuildId(this.fefenyasModel, guild.id);

            const isGuildBig = guild.memberCount > 1000;
            if (isGuildBig) return;

            const members = guild.members.cache.values();

            await lastValueFrom(
              from(members).pipe(
                await mergeMap(async (member) => {
                  const isBot = member.user.bot;
                  if (isBot) return;

                  await setContestUserActive(
                    this.fefenyasModel,
                    member.user.id,
                    member.displayName,
                    guild.id,
                  );
                }),
              ),
            );

            await this.loadDialog();
            await this.contestGuildFlow(guild);
          } catch (errorException) {
            this.logger.error(errorException);
          }
        }, 5),
      ),
    );
  }
}
