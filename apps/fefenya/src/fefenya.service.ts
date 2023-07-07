import { Cron, CronExpression } from '@nestjs/schedule';
import { gotdCommand, gotsStatsCommand, SlashCommand } from '@cmnw/commands';
import { Injectable, Logger, OnApplicationBootstrap } from '@nestjs/common';
import { from, lastValueFrom, mergeMap } from 'rxjs';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { DateTime } from 'luxon';

import {
  Channels,
  Keys,
  Logs,
  Permissions,
  Users,
  UsersFefenya,
} from '@cmnw/mongo';

import {
  GOTD_GREETING_FLOW,
  gotdGreeter,
  loadKey,
  indexFefenyaUser,
  pickRandomFefenyaUser,
} from '@cmnw/core';

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

@Injectable()
export class FefenyaService implements OnApplicationBootstrap {
  private readonly logger = new Logger(FefenyaService.name, {
    timestamp: true,
  });
  private client: Client;
  private fefenyaKey: Keys;
  private commandsMessage: Collection<string, SlashCommand> = new Collection();
  private commandSlash = [];
  private readonly rest = new REST({ version: '10' });

  constructor(
    @InjectModel(Keys.name)
    private readonly keysModel: Model<Keys>,
    @InjectModel(Users.name)
    private readonly usersModel: Model<Users>,
    @InjectModel(UsersFefenya.name)
    private readonly usersFefenyaModel: Model<UsersFefenya>,
    @InjectModel(Permissions.name)
    private readonly permissionsModel: Model<Permissions>,
    @InjectModel(Channels.name)
    private readonly channelsModel: Model<Channels>,
    @InjectModel(Logs.name)
    private readonly logsModel: Model<Logs>,
  ) {}

  async onApplicationBootstrap(): Promise<void> {
    try {
      await this.loadFefenya();
      await this.loadCommands();
      await this.loadUsersFefenya();
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

      this.fefenyaKey = await loadKey(this.keysModel, 'Fefenya');

      await this.client.login(this.fefenyaKey.token);
      this.rest.setToken(this.fefenyaKey.token);
    } catch (errorOrException) {
      this.logger.error(`loadFefenya: ${errorOrException}`);
    }
  }

  private async loadCommands(): Promise<void> {
    this.commandsMessage.set(gotsStatsCommand.name, gotsStatsCommand);
    this.commandSlash.push(gotsStatsCommand.slashCommand.toJSON());
    this.commandsMessage.set(gotdCommand.name, gotdCommand);
    this.commandSlash.push(gotdCommand.slashCommand.toJSON());

    await this.rest.put(Routes.applicationCommands(this.client.user.id), {
      body: this.commandSlash,
    });

    this.logger.log('Commands updated');
  }

  private async loadUsersFefenya() {
    await lastValueFrom(
      from(this.client.guilds.cache.values()).pipe(
        mergeMap(async (guild) => {
          try {
            const fefenyaUsers = Array.from(guild.members.cache.values()).map(
              (member) =>
                new this.usersFefenyaModel({
                  _id: member.id,
                  username: member.displayName,
                  guildId: member.guild.id,
                  count: 0,
                }),
            );

            await this.usersFefenyaModel.insertMany(fefenyaUsers, {
              ordered: false,
              throwOnValidationError: false,
            });
          } catch (errorException) {
            this.logger.error(errorException);
          }
        }, 5),
      ),
    );
  }

  async bot(): Promise<void> {
    try {
      this.client.on(Events.ClientReady, async () =>
        this.logger.log(`Logged in as ${this.client.user.tag}!`),
      );

      this.client.on(Events.GuildCreate, async (guild): Promise<void> => {
        try {
          // TODO index guild binding

          for (const guildMember of guild.members.cache.values()) {
            const isUserBot = guildMember.user.bot;
            if (isUserBot) return;
            await indexFefenyaUser(this.usersFefenyaModel, guildMember);
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

              await this.channelsModel.findByIdAndUpdate(
                interaction.channel.id,
                {
                  tags: { $addToSet: 'fefenya' },
                },
              );

              await command.executeInteraction({
                interaction,
                models: {
                  usersFefenyaModel: this.usersFefenyaModel,
                  logsModel: this.logsModel,
                  permissionsModel: this.permissionsModel,
                  channelsModel: this.channelsModel,
                },
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
    const guilds = Array.from(this.client.guilds.cache.values());

    await lastValueFrom(
      from(guilds).pipe(
        mergeMap(async (guild) => {
          try {
            let fefenyaUser =
              await this.usersFefenyaModel.findOne<UsersFefenya>({
                guildId: guild.id,
                isGotd: true,
              });

            // TODO if hello world!

            if (fefenyaUser) {
              const isGotdTriggered =
                DateTime.fromJSDate(fefenyaUser.updatedAt) <
                DateTime.now().minus({ hours: 24 });
              /**
               * @description Is GotD was not triggered today
               * @description revoke old status
               */
              if (isGotdTriggered) {
                fefenyaUser.isGotd = false;
                await fefenyaUser.save();
                return;
              }
            }

            if (!fefenyaUser) {
              fefenyaUser = await pickRandomFefenyaUser(
                this.usersFefenyaModel,
                guild.id,
              );

              const guildMember = guild.members.cache.get(fefenyaUser.id);
              if (!guildMember) return;

              this.logger.log(
                `Fefenya pre-pick user as a gaylord: ${fefenyaUser._id} :: ${fefenyaUser.username}`,
              );

              const greetingFlow = GOTD_GREETING_FLOW.random();
              const arrLength = greetingFlow.length;

              const channelEntity = await this.channelsModel.findOne<Channels>({
                guildId: guild.id,
                tag: 'Fefenya',
              });

              const channel = guild.channels.cache.get(channelEntity._id);

              const isChannelText = channel.type !== ChannelType.GuildText;
              if (isChannelText) return;

              for (let i = 0; i < arrLength; i++) {
                const content =
                  arrLength - 1 === i
                    ? gotdGreeter(greetingFlow[i], fefenyaUser.id)
                    : greetingFlow[i];

                await channel.send({ content });
              }
            }
          } catch (errorOrException) {
            this.logger.error(`idleReaction: ${errorOrException}`);
          }
        }),
      ),
    );
  }
}
