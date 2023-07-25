import { gotdCommand, gotsStatsCommand, SlashCommand } from '@cmnw/commands';
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
  Channels,
  Event,
  Fefenya,
  Guilds,
  Keys,
  Permissions,
  Profiles,
  Prompts,
  Roles,
  Users,
} from '@cmnw/mongo';

import {
  ChatFlowDto,
  chatQueue,
  CMNW_ORACULUM_PROJECTS,
  FEFENYA_HOLIDAY,
  FEFENYA_NAMING,
  formatNaming,
  formatRedisKey,
  GENDER_ENUM,
  getChannelByTags,
  getDialogPromptsByTags,
  getLastDialog,
  getProfile,
  getRoleByTags,
  gotdGreeter,
  indexFefenyas,
  loadKey,
  OPENAI_MODEL,
  pickRandomFefenyaUser,
  prettyGotd,
  prettyReply,
  PROMPT_TYPE_ENUM,
  randomMixMax,
  setLastDialog,
  STATUS_ENUM,
  TAGS_ENUM,
} from '@cmnw/core';

import {
  Client,
  Collection,
  Events,
  GatewayIntentBits,
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
    @InjectModel(Users.name)
    private readonly usersModel: Model<Users>,
    @InjectModel(Fefenya.name)
    private readonly fefenyasModel: Model<Fefenya>,
    @InjectModel(Permissions.name)
    private readonly permissionsModel: Model<Permissions>,
    @InjectModel(Channels.name)
    private readonly channelsModel: Model<Channels>,
    @InjectModel(Guilds.name)
    private readonly guildsModel: Model<Guilds>,
    @InjectModel(Event.name)
    private readonly eventModel: Model<Event>,
    @InjectModel(Roles.name)
    private readonly rolesModel: Model<Roles>,
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
    this.commandsMessage.set(gotsStatsCommand.name, gotsStatsCommand);
    this.commandsMessage.set(gotdCommand.name, gotdCommand);

    const commands = [
      gotdCommand.slashCommand.toJSON(),
      gotsStatsCommand.slashCommand.toJSON(),
    ];

    await this.rest.put(Routes.applicationCommands(this.client.user.id), {
      body: commands,
    });

    this.logger.log('Commands updated');
  }

  @Cron(CronExpression.EVERY_30_MINUTES_BETWEEN_10AM_AND_7PM)
  private async proc() {
    await this.loadFefenyas();
  }

  private async loadFefenyas() {
    await lastValueFrom(
      from(this.client.guilds.cache.values()).pipe(
        mergeMap(async (guild) => {
          try {
            const chance50 = randomMixMax(0, 1);
            if (chance50 > 0) return;

            await this.fefenyasModel.updateMany(
              {
                guildId: guild.id,
              },
              {
                status: STATUS_ENUM.DISABLED,
              },
            );

            await lastValueFrom(
              from(guild.members.cache.values()).pipe(
                await mergeMap(async (member) => {
                  const isBot = member.user.bot;
                  if (isBot) return;

                  await this.fefenyasModel.findByIdAndUpdate(
                    member.id,
                    {
                      _id: member.id,
                      username: member.displayName,
                      guildId: member.guild.id,
                      status: STATUS_ENUM.ACTIVE,
                    },
                    { upsert: true, new: true },
                  );
                }),
              ),
            );

            await this.gotdContestFlow(guild.id);
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
                eventModel: this.eventModel,
                permissionsModel: this.permissionsModel,
                channelsModel: this.channelsModel,
                rolesModel: this.rolesModel,
                promptsModel: this.promptsModel,
                guildsModel: this.guildsModel,
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
    const sets = new Map([
      [
        PROMPT_TYPE_ENUM.COMMAND,
        [
          TAGS_ENUM.FEFENYA,
          TAGS_ENUM.CONTEST,
          TAGS_ENUM.COMMAND,
          TAGS_ENUM.WARM,
        ],
      ],
      [PROMPT_TYPE_ENUM.IGNORE, [TAGS_ENUM.FEFENYA, TAGS_ENUM.IGNORE]],
      [PROMPT_TYPE_ENUM.ERROR, [TAGS_ENUM.FEFENYA, TAGS_ENUM.ERROR]],
      [
        PROMPT_TYPE_ENUM.GOTD,
        [
          TAGS_ENUM.FEFENYA,
          TAGS_ENUM.CONTEST,
          TAGS_ENUM.COMMAND,
          TAGS_ENUM.GOTD,
        ],
      ],
    ]);

    for (const [promptType, tags] of sets.entries()) {
      const promptsCount = await this.promptsModel.count({
        name: CMNW_ORACULUM_PROJECTS.FEFENYA,
        event: promptType,
        type: promptType,
      });

      const isPromptsCount = promptsCount > 10;
      if (isPromptsCount) {
        this.logger.log(
          `Messages for ${promptType} :: ${promptsCount} > 10 :: ${isPromptsCount}`,
        );
        continue;
      }

      const prompts = await getDialogPromptsByTags(this.promptsModel, tags);
      const name = FEFENYA_NAMING.random();
      const chatFlow = ChatFlowDto.fromPromptsFlow(
        prompts.map((p) =>
          Object.assign(p, { text: formatNaming(p.text, name) }),
        ),
      );
      const response = await this.amqpConnection.request<string>({
        exchange: chatQueue.name,
        routingKey: 'v4',
        payload: chatFlow,
        timeout: 60 * 1000,
      });

      await this.promptsModel.create({
        profileId: this.fefenyaProfile._id,
        name: CMNW_ORACULUM_PROJECTS.FEFENYA,
        event: promptType,
        type: promptType,
        text: response,
        temperature: 50,
        isGenerated: true,
        version: 4,
        model: OPENAI_MODEL.ChatGPT_4,
      });

      this.logger.log(`Generated ${promptType} reply for ${name}`);
    }
  }

  async generateContestDialog(guildId: string) {
    const tags = [TAGS_ENUM.FEFENYA, TAGS_ENUM.CONTEST, TAGS_ENUM.FLOW_2];
    const channel = await this.channelsModel.findOne<Channels>({
      guildId: guildId,
      tags: { $all: [TAGS_ENUM.CONTEST, TAGS_ENUM.FEFENYA] },
    });

    if (!channel)
      throw new Error(
        `channel not exists for ${TAGS_ENUM.CONTEST} :: ${TAGS_ENUM.FEFENYA}`,
      );

    const prompts = await getDialogPromptsByTags(this.promptsModel, tags);
    const chatFlow = ChatFlowDto.fromPromptsFlow(prompts);
    const response = await this.amqpConnection.request<string>({
      exchange: chatQueue.name,
      routingKey: 'v4',
      payload: chatFlow,
      timeout: 60 * 1000,
    });

    const name = FEFENYA_NAMING.random();

    const prettyReplies = await prettyGotd(
      this.fefenyasModel,
      guildId,
      response,
      name,
    );

    const replies = prettyReplies
      .map(
        (eventPrompt, i, l) =>
          new this.promptsModel({
            profileId: this.fefenyaProfile._id,
            name: `${CMNW_ORACULUM_PROJECTS.FEFENYA}:${FEFENYA_HOLIDAY.GOTD}`,
            type: PROMPT_TYPE_ENUM.DIALOG,
            temperature: 50,
            isGenerated: true,
            version: 4,
            model: OPENAI_MODEL.ChatGPT_4,
            event: FEFENYA_HOLIDAY.GOTD,
            isUsed: false,
            isLast: l.length - 1 === i,
            text: eventPrompt.trim(),
            // TODO tags?
            position: i,
          }),
      )
      .map((document, index, array) => {
        const isPrevious = array[index - 1];
        if (isPrevious) document.previousPrompt = isPrevious._id;
        const isNext = array[index + 1];
        if (isNext) document.nextPrompt = isNext._id;
        return document;
      });

    this.logger.log(`Replies receive ${replies.length}`);
    await this.promptsModel.insertMany(replies);

    await setLastDialog(this.promptsModel, FEFENYA_HOLIDAY.GOTD);
    this.logger.log(`Last dialog set ${FEFENYA_HOLIDAY.GOTD}`);
  }

  async gotdContestFlow(guildId: string) {
    const key = formatRedisKey('gotdContestFlow', guildId);
    try {
      const isContestInProgress = Boolean(await this.redisService.exists(key));
      if (isContestInProgress) {
        throw new Error(`contest is already in progress`);
      }

      await this.redisService.set(key, 1, 'EX', 70);

      const tod = DateTime.now()
        .setZone('Europe/Moscow')
        .startOf('day')
        .toJSDate();

      const fefenyaUser = await this.fefenyasModel.findOne<Fefenya>({
        guildId: guildId,
        isGotd: true,
        updatedAt: { $gte: tod },
      });

      if (fefenyaUser) {
        throw new Error(
          `fefenya user already found ${fefenyaUser._id} :: ${fefenyaUser.username}`,
        );
      }

      const lastDialog = await getLastDialog(
        this.promptsModel,
        FEFENYA_HOLIDAY.GOTD,
      );

      const isGenerate = !lastDialog && !fefenyaUser;
      if (isGenerate) await this.generateContestDialog(guildId);

      if (!lastDialog) {
        throw new Error(`last dialog ${FEFENYA_HOLIDAY.GOTD} not found`);
      }

      const tags = [TAGS_ENUM.CONTEST, TAGS_ENUM.FEFENYA];

      const fefenyaChannel = await getChannelByTags(this.channelsModel, tags);
      if (!fefenyaChannel) throw new Error(`bind channel not found`);
      let channel = this.client.channels.cache.get(fefenyaChannel._id);
      if (!channel)
        channel = await this.client.channels.fetch(fefenyaChannel._id);
      if (!channel) {
        throw new Error(`channel ${fefenyaChannel._id} not found`);
      }

      const content = prettyReply(lastDialog.text);
      await (channel as TextChannel).send({ content });

      if (!lastDialog.isLast) {
        this.logger.log(
          `Contest flow successfully ended ${lastDialog.event} :: ${lastDialog.position}`,
        );
        return;
      }

      const gotdMember = await this.transitRole(guildId);
      const userTag = gotdGreeter(gotdMember._id);
      await (channel as TextChannel).send({ content: userTag });
    } catch (errorOrException) {
      this.logger.error(`gotdContestFlow :: ${errorOrException}`);
    } finally {
      await this.redisService.del(key);
    }
  }

  async transitRole(guildId: string) {
    const gotdRole = await getRoleByTags(this.rolesModel, guildId, [
      TAGS_ENUM.FEFENYA,
      TAGS_ENUM.CONTEST,
    ]);

    if (!gotdRole) {
      this.logger.warn(`role with ${TAGS_ENUM.FEFENYA} not found!`);
    }

    let role: Role | undefined;

    const guild = this.client.guilds.cache.get(guildId);
    const hasPermissions = guild.members.me.permissions.has(
      PermissionsBitField.Flags.ManageRoles,
    );

    const isTransit = hasPermissions && gotdRole;
    if (isTransit) {
      role = guild.roles.cache.get(gotdRole._id);
      if (role) {
        const fefenyaUser = await this.fefenyasModel.findOne<Fefenya>(
          {
            guildId: guildId,
            isGotd: true,
          },
          {
            isGotd: false,
          },
        );
        const membersId = Array.from(role.members.keys());
        if (fefenyaUser) membersId.push(fefenyaUser._id);

        for (const memberId of membersId) {
          const gotdGuildMember = guild.members.cache.get(memberId);
          await gotdGuildMember.roles.remove(role);
        }
      }
    }

    const fefenyaUser = await pickRandomFefenyaUser(
      this.fefenyasModel,
      guildId,
    );

    if (isTransit && role) {
      const member = guild.members.cache.get(fefenyaUser._id);
      await member.roles.add(role);
    }

    return fefenyaUser;
  }
}
