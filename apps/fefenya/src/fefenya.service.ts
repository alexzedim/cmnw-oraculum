import { Injectable, Logger, OnApplicationBootstrap } from '@nestjs/common';
import { AmqpConnection } from '@golevelup/nestjs-rabbitmq';
import { from, lastValueFrom, mergeMap } from 'rxjs';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Cron, CronExpression } from '@nestjs/schedule';
import { InjectRedis } from '@nestjs-modules/ioredis';
import Redis from 'ioredis';
import { DateTime } from 'luxon';
import {
  SlashCommand,
  contestStatsCommand,
  contestStartCommand,
  contestBindCommand,
} from '@cmnw/commands';

import { Contests, Fefenya, Keys, Profiles, Prompts } from '@cmnw/mongo';

import {
  CHAT_ROLE_ENUM,
  ChatFlowDto,
  chatQueue,
  CMNW_ORACULUM_PROJECTS,
  FEFENYA_NAMING,
  FEFENYA_PROMPTS,
  GENDER_ENUM,
  getProfile,
  getSystemPrompt,
  indexFefenyas,
  loadKey,
  OPENAI_MODEL,
  pickRandomFefenya,
  prettyContestReply,
  prettyContestPrompt,
  PROMPT_TYPE_ENUM,
  randomMixMax,
  resetContestByGuildId,
  setContestUserActive,
  TAGS_ENUM,
  getRandomReplyByEvent,
  ReplyV4Dto,
} from '@cmnw/core';

import {
  Client,
  Collection,
  Events,
  GatewayIntentBits,
  Guild,
  Partials,
  PermissionsBitField,
  REST,
  Role,
  Routes,
  TextChannel,
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
        mergeMap(async (guild) => {
          try {
            const chance50 = randomMixMax(0, 1);
            if (chance50 > 0) return;

            await resetContestByGuildId(this.fefenyasModel, guild.id);

            const isBig = guild.memberCount > 1000;
            if (isBig) return;

            // TODO for large servers pick random index
            await lastValueFrom(
              from(guild.members.cache.values()).pipe(
                await mergeMap(async (member) => {
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
        }, 5),
      ),
    );
  }

  async bot(): Promise<void> {
    try {
      this.client.on(Events.ClientReady, async () => {
        this.logger.log(`Logged in as ${this.client.user.tag}!`);
      });

      this.client.on(Events.GuildCreate, async (guild): Promise<void> => {
        try {
          for (const guildMember of guild.members.cache.values()) {
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
              content: 'There was an error while executing this command!',
              ephemeral: true,
            });
          }
        },
      );
    } catch (errorOrException) {
      this.logger.error(`Fefenya: ${errorOrException}`);
    }
  }

  async loadDialog() {
    const dialogPrompts: Array<Prompts> = [];
    const profileName = ['Efhenya', 'Fefenya'][randomMixMax(0, 1)];

    const systemCorePrompt = await getSystemPrompt(
      this.promptsModel,
      profileName,
    );

    for (const fefenyaPrompt of FEFENYA_PROMPTS) {
      const prompt = await this.promptsModel.findOneAndUpdate<Prompts>(
        {
          type: fefenyaPrompt.type,
          role: CHAT_ROLE_ENUM.USER,
        },
        fefenyaPrompt,
        {
          upsert: true,
          new: true,
        },
      );

      const countGeneratedPrompts = await this.promptsModel.count({
        type: fefenyaPrompt.type,
        role: CHAT_ROLE_ENUM.ASSISTANT,
        isGenerated: true,
      });

      const control = 20;
      const isGeneratedPromptExists = countGeneratedPrompts >= control;
      if (isGeneratedPromptExists) {
        this.logger.log(
          `Messages for ${fefenyaPrompt.type} :: ${countGeneratedPrompts} >= ${control} :: ${isGeneratedPromptExists}`,
        );
        continue;
      }

      const chatFlow = ChatFlowDto.fromPromptsFlow([systemCorePrompt, prompt]);
      const response = await this.amqpConnection.request<ReplyV4Dto>({
        exchange: chatQueue.name,
        routingKey: 'v4',
        payload: chatFlow,
        timeout: 60 * 1000,
      });

      const isContest = fefenyaPrompt.type === PROMPT_TYPE_ENUM.CONTEST;

      const prompts = isContest
        ? prettyContestReply(response.reply).map(
            (text, i) =>
              new this.promptsModel({
                profileId: this.fefenyaProfile._id,
                event: fefenyaPrompt.event,
                type: fefenyaPrompt.type,
                text,
                role: CHAT_ROLE_ENUM.ASSISTANT,
                isGenerated: true,
                version: 4,
                position: i + 1,
                tags: fefenyaPrompt.tags,
                model: OPENAI_MODEL.ChatGPT_4,
              }),
          )
        : [
            new this.promptsModel({
              profileId: this.fefenyaProfile._id,
              event: fefenyaPrompt.event,
              type: fefenyaPrompt.type,
              text: response,
              role: CHAT_ROLE_ENUM.ASSISTANT,
              isGenerated: true,
              version: 4,
              tags: fefenyaPrompt.tags,
              model: OPENAI_MODEL.ChatGPT_4,
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
    await lastValueFrom(
      from(this.client.guilds.cache.values()).pipe(
        mergeMap(async (guild) => {
          try {
            await resetContestByGuildId(this.fefenyasModel, guild.id);

            const isGuildBig = guild.memberCount > 1000;
            if (isGuildBig) return;

            await lastValueFrom(
              from(guild.members.cache.values()).pipe(
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
            await this.contestFlow(guild);
          } catch (errorException) {
            this.logger.error(errorException);
          }
        }, 5),
      ),
    );
  }

  async endContestWinnerFlow(guild: Guild, contest: Contests) {
    let role: Role;
    let hasPermissions = false;
    const winnerAt = new Date();

    if (contest.roleId) {
      role = guild.roles.cache.get(contest.roleId);
      hasPermissions = guild.members.me.permissions.has(
        PermissionsBitField.Flags.ManageRoles,
      );
    }

    const isRoleExists = role && hasPermissions;
    const isOldWinner = isRoleExists && contest.winnerUserId;
    if (isOldWinner) {
      await guild.members.cache.get(contest.winnerUserId).roles.remove(role.id);
    }

    // TODO winner as a random user from guild members not bot++

    if (isRoleExists) {
      await guild.members.cache.get(trophyWinner.userId).roles.add(role.id);
    }

    // TODO reset status
    const promptsStaring = await this.promptsModel.find<Prompts>({
      // TODO from current profile generated
      blockId: { $ne: contest.blockId },
      position: 1,
      isGenerated: true,
      event: PROMPT_TYPE_ENUM.TROPHY,
      type: PROMPT_TYPE_ENUM.CONTEST,
      role: CHAT_ROLE_ENUM.ASSISTANT,
    });

    const startingContestPrompt =
      promptsStaring[randomMixMax(0, promptsStaring.length - 1)];

    contest.promptId = startingContestPrompt._id;
    contest.winnerHistory.push(trophyWinner.userId);
    contest.winnerUserId = trophyWinner.userId;
    contest.winnerAt = winnerAt;
    await contest.save();

    const promoPrompt = await getRandomReplyByEvent(
      this.promptsModel,
      PROMPT_TYPE_ENUM.PROMO,
    );

    return prettyContestPrompt(promoPrompt.text, name, contest.trophy, winner);
  }

  async contestFlow(guild: Guild) {
    const guildContests = await this.contestsModel.find<Contests>({
      guildId: guild.id,
    });

    await lastValueFrom(
      from(guildContests).pipe(
        mergeMap(async (contest) => {
          const isProcNegative = randomMixMax(0, 1);
          if (isProcNegative > 0) return;

          const isNextPromptSet = Boolean(contest.promptId);
          // TODO find bucket of prompts for contest
          // TODO current prompts and next prompt
          const contestPrompts = await this.promptsModel
            .find<Prompts>({
              blockId: contest.blockId,
              position: { gte: contest.promptNextPositionCursor },
            })
            .sort({ position: 1 });

          const [currentPrompt, nextPrompt] = contestPrompts;

          const isLast = Boolean(currentPrompt) && !Boolean(nextPrompt);
          if (isLast) {
            // TODO find next new bucket & bind to contest
            await this.endContestWinnerFlow(guild, contest);
          }

          const promptNextPositionCursor = isLast
            ? 1
            : contest.promptNextPositionCursor + 1;

          const name = FEFENYA_NAMING.random();
          const isCapPromptsHistory = contest.promptsHistory.length >= 10;
          const isCapWinnerHistory = contest.winnerHistory.length >= 10;
          if (isCapWinnerHistory) {
            contest.winnerHistory.pop();
          }

          if (isCapPromptsHistory) {
            contest.promptsHistory.pop();
          }

          const winner = '';
          const promoContent = '';

          const channel = this.client.channels.cache.get(contest.channelId);
          if (!channel) {
            throw new Error(`Channel ${contest.channelId} not found!`);
          }

          await (channel as TextChannel).send({ content });
        }, 5),
      ),
    );

    if (prompt.isLast) {
      const isRoleExists = role && hasPermissions;
      if (isRoleExists) {
        const oldTrophyUser = guild.members.cache.get(contest.winnerUserId);
        await oldTrophyUser.roles.remove(role.id);
      }

      const trophyWinner = await pickRandomFefenya(
        this.fefenyasModel,
        guild.id,
      );

      if (isRoleExists) {
        const oldTrophyUser = guild.members.cache.get(trophyWinner.userId);
        await oldTrophyUser.roles.add(role.id);
      }

      winner = trophyWinner.username;

      const trophyStartPrompts = await this.promptsModel.find<Prompts>({
        event: PROMPT_TYPE_ENUM.TROPHY,
        type: PROMPT_TYPE_ENUM.CONTEST,
        role: CHAT_ROLE_ENUM.ASSISTANT,
        position: 1,
      });

      const trophyStartingPrompt =
        trophyStartPrompts[randomMixMax(0, trophyStartPrompts.length - 1)];

      contest.promptId = trophyStartingPrompt._id;
      contest.winnerHistory.push(trophyWinner.userId);
      contest.winnerUserId = trophyWinner.userId;
      contest.winnerAt = winnerAt;

      const promoPrompt = await getRandomReplyByEvent(
        this.promptsModel,
        PROMPT_TYPE_ENUM.PROMO,
      );

      promoContent = prettyContestPrompt(
        promoPrompt.text,
        name,
        contest.trophy,
        winner,
      );
    }

    const content = prettyContestPrompt(
      prompt.text,
      name,
      contest.trophy,
      winner,
    );

    const channel = this.client.channels.cache.get(contest.channelId);
    if (!channel) {
      throw new Error(`Channel ${contest.channelId} not found!`);
    }

    await (channel as TextChannel).send({ content });

    if (promoContent)
      await (channel as TextChannel).send({ content: promoContent });

    contest.promptsHistory.push(prompt._id);

    await contest.save();
  }
}
