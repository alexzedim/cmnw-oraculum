import { gotdCommand, GotsStatsCommand } from './commands';
import { InjectRedis, Redis } from '@nestjs-modules/ioredis';
import { Cron, CronExpression } from '@nestjs/schedule';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import {
  FEFENYA_STORAGE_KEYS,
  formatRedisKey,
  GOTD_GREETING_FLOW,
  gotdGreeter,
  ISlashCommand,
  cryptoRandomIntBetween,
} from '@cmnw/core';

import {
  Injectable,
  Logger,
  NotFoundException,
  OnApplicationBootstrap,
} from '@nestjs/common';

import {
  ChannelType,
  Client,
  Collection,
  Events,
  GatewayIntentBits,
  Partials,
  REST,
  Routes,
} from 'discord.js';

import {
  CoreUsersEntity,
  FefenyaUsersEntity,
  GuildsEntity,
  UsersEntity,
} from '@cmnw/pg';

@Injectable()
export class FefenyaService implements OnApplicationBootstrap {
  private readonly logger = new Logger(FefenyaService.name, {
    timestamp: true,
  });
  private client: Client;
  private fefenyaUser: CoreUsersEntity;
  private commandsMessage: Collection<string, ISlashCommand> = new Collection();
  private commandSlash = [];
  private readonly rest = new REST({ version: '10' });

  constructor(
    @InjectRedis()
    private readonly redisService: Redis,
    @InjectRepository(UsersEntity)
    private readonly usersRepository: Repository<UsersEntity>,
    @InjectRepository(GuildsEntity)
    private readonly guildsRepository: Repository<GuildsEntity>,
    @InjectRepository(CoreUsersEntity)
    private readonly coreUsersRepository: Repository<CoreUsersEntity>,
    @InjectRepository(FefenyaUsersEntity)
    private readonly fefenyaRepository: Repository<FefenyaUsersEntity>,
  ) {}

  async onApplicationBootstrap(): Promise<void> {
    try {
      await this.loadFefenya();
      await this.loadCommands();
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

      const fefenyaUserEntity = await this.coreUsersRepository.findOneBy({
        name: 'Fefenya',
      });

      if (!fefenyaUserEntity) throw new NotFoundException('Fefenya not found!');

      if (!fefenyaUserEntity.token)
        throw new NotFoundException('Fefenya token not found!');

      this.fefenyaUser = fefenyaUserEntity;

      await this.client.login(this.fefenyaUser.token);
      this.rest.setToken(this.fefenyaUser.token);
    } catch (errorOrException) {
      this.logger.error(`loadFefenya: ${errorOrException}`);
    }
  }

  private async loadCommands(): Promise<void> {
    this.commandsMessage.set(GotsStatsCommand.name, GotsStatsCommand);
    this.commandSlash.push(GotsStatsCommand.slashCommand.toJSON());
    this.commandsMessage.set(gotdCommand.name, gotdCommand);
    this.commandSlash.push(gotdCommand.slashCommand.toJSON());

    await this.rest.put(Routes.applicationCommands(this.client.user.id), {
      body: this.commandSlash,
    });

    this.logger.log('Commands updated');
  }

  async bot(): Promise<void> {
    try {
      this.client.on(Events.ClientReady, async () =>
        this.logger.log(`Logged in as ${this.client.user.tag}!`),
      );

      this.client.on(Events.GuildCreate, async (guild): Promise<void> => {
        try {
          for (const [userId, guildMember] of guild.members.cache.entries()) {
            if (!guildMember.user.bot) {
              let fefenyaUsersEntity = await this.fefenyaRepository.findOneBy({
                id: userId,
              });
              if (!fefenyaUsersEntity) {
                fefenyaUsersEntity = this.fefenyaRepository.create({
                  id: userId,
                  name: guildMember.user.username,
                  guildId: guild.id,
                  count: 0,
                });

                await this.fefenyaRepository.save(fefenyaUsersEntity);
              }
            }
          }
        } catch (errorException) {
          this.logger.error(errorException);
        }
      });

      this.client.on(Events.MessageCreate, async (message) => {
        try {
          if (message.author.bot) return;

          const isUserCached = await this.redisService.sismember(
            formatRedisKey(message.guildId),
            message.member.user.id,
          );

          if (isUserCached) return;

          let fefenyaUsersEntity = await this.fefenyaRepository.findOneBy({
            id: message.member.user.id,
          });

          if (!fefenyaUsersEntity) {
            fefenyaUsersEntity = this.fefenyaRepository.create({
              id: message.member.user.id,
              name: message.member.user.username,
              guildId: message.guildId,
              count: 0,
            });

            await this.fefenyaRepository.save(fefenyaUsersEntity);

            await this.redisService.sadd(
              formatRedisKey(message.guildId),
              message.member.user.id,
            );
          }
        } catch (errorException) {
          this.logger.error(errorException);
        }
      });

      this.client.on(
        Events.InteractionCreate,
        async (interaction): Promise<void> => {
          if (interaction.isChatInputCommand()) {
            try {
              const command = this.commandsMessage.get(interaction.commandName);
              if (!command) return;
              await command.executeInteraction({
                interaction,
                repository: this.fefenyaRepository,
                redis: this.redisService,
                logger: this.logger,
              });
            } catch (errorException) {
              this.logger.error(errorException);
              await interaction.reply({
                content: 'There was an error while executing this command!',
                ephemeral: true,
              });
            }
          }
        },
      );
    } catch (errorOrException) {
      this.logger.error(`Fefenya: ${errorOrException}`);
    }
  }

  @Cron(CronExpression.EVERY_DAY_AT_9PM)
  async idleReaction() {
    try {
      const isGotdTriggered = Boolean(
        await this.redisService.exists(FEFENYA_STORAGE_KEYS.GOTD_TOD_STATUS),
      );

      const [channel, guild] = await Promise.all([
        // TODO remember channel from last triggered or bind one
        await this.client.channels.fetch('881965561892974672'),
        // TODO take from binding
        this.client.guilds.fetch('881954435662766150'),
      ]);

      this.logger.debug(`isGotdTriggered: ${isGotdTriggered}`);
      /**
       * TODO refactor codebase
       * @description  Role (ID882360954980012082) assigment
       */
      if (!isGotdTriggered) {
        if (!channel || !guild) return;

        const to = await this.fefenyaRepository.count();
        const randomInt = cryptoRandomIntBetween(1, to);

        this.logger.log(
          `Fefenya randomize in between ${to} values, roll is ${randomInt}`,
        );

        const [fefenyaUsersEntity] = await this.fefenyaRepository.find({
          order: {
            count: 'ASC',
          },
          skip: randomInt,
          take: 1,
        });

        this.logger.log(
          `Fefenya pre-pick user as a gaylord: ${fefenyaUsersEntity.id}`,
        );

        const guildMember = guild.members.cache.get(fefenyaUsersEntity.id);
        if (!guildMember) return;

        await this.redisService.set(
          FEFENYA_STORAGE_KEYS.GOTD_TOD_STATUS,
          guildMember.displayName,
        );

        const randIndex = cryptoRandomIntBetween(1, GOTD_GREETING_FLOW.size);
        const greetingFlow = GOTD_GREETING_FLOW.get(randIndex);
        const arrLength = greetingFlow.length;
        let content: string;

        if (channel.type === ChannelType.GuildText) {
          for (let i = 0; i < arrLength; i++) {
            content =
              arrLength - 1 === i
                ? gotdGreeter(greetingFlow[i], fefenyaUsersEntity.id)
                : greetingFlow[i];

            if (i === 0) {
              await channel.send({ content });
            } else {
              await channel.send({ content });
            }
          }
        }
      } else {
        await this.redisService.del(FEFENYA_STORAGE_KEYS.GOTD_TOD_STATUS);
      }
      await this.redisService.del(formatRedisKey(guild.id));
      return isGotdTriggered;
    } catch (e) {
      console.error(e);
    }
  }
}
