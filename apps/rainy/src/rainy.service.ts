import { Injectable, Logger, OnApplicationBootstrap } from '@nestjs/common';
import { capitalizeFirstLetter } from 'normalize-text';
import { InjectRedis, Redis } from '@nestjs-modules/ioredis';
import { REST } from '@discordjs/rest';
import { GatewayIntentBits, Routes } from 'discord-api-types/v10';
import { Ban, Clearance, PovCommand, VoteUnban, Whoami } from './commands';
import { InjectModel } from '@nestjs/mongoose';
import { Bans, Channels, Guilds, Keys, Permissions, Users } from '@cmnw/mongo';
import { AmqpConnection } from '@golevelup/nestjs-rabbitmq';
import { banButtons, banEmbed, SlashCommand } from '@cmnw/commands';
import { Model } from 'mongoose';

import {
  DISCORD_CLASS_HALLS,
  DISCORD_REASON_BANS,
  DISCORD_SERVER_RENAME,
  EventDto,
  indexGuildByRepository,
  loadKey,
} from '@cmnw/core';

import {
  Client,
  TextChannel,
  Collection,
  EmbedBuilder,
  Events,
  Partials,
  GuildBan,
} from 'discord.js';

@Injectable()
export class RainyService implements OnApplicationBootstrap {
  private client: Client;
  private rainyUser: Keys;
  private commandsMessage: Collection<string, SlashCommand> = new Collection();

  private readonly rest = new REST({ version: '10' });
  private readonly logger = new Logger(RainyService.name, { timestamp: true });

  constructor(
    private readonly amqpConnection: AmqpConnection,
    @InjectRedis()
    private readonly redisService: Redis,
    @InjectModel(Keys.name)
    private readonly keysModel: Model<Keys>,
    @InjectModel(Users.name)
    private readonly usersModel: Model<Users>,
    @InjectModel(Permissions.name)
    private readonly permissionsModel: Model<Permissions>,
    @InjectModel(Channels.name)
    private readonly channelsModel: Model<Channels>,
    @InjectModel(Guilds.name)
    private readonly guildsModel: Model<Guilds>,
    @InjectModel(Bans.name)
    private readonly bansModel: Model<Bans>,
  ) {}
  async onApplicationBootstrap(): Promise<void> {
    try {
      this.client = new Client({
        partials: [Partials.User, Partials.Channel, Partials.GuildMember],
        intents: [
          GatewayIntentBits.Guilds,
          GatewayIntentBits.GuildMembers,
          GatewayIntentBits.GuildInvites,
          GatewayIntentBits.GuildModeration,
        ],
        presence: {
          status: 'online',
        },
      });

      await this.loadRainy();
      await this.loadCommands();
      await this.bot();
    } catch (errorOrException) {
      this.logger.error(`Application: ${errorOrException}`);
    }
  }

  private async loadRainy(): Promise<void> {
    try {
      this.rainyUser = await loadKey(this.keysModel, 'Rainy');
    } catch (errorOrException) {
      this.logger.error(`loadRainy: ${errorOrException}`);
    }
  }

  private async loadCommands(): Promise<void> {
    this.commandsMessage.set(Ban.name, Ban);
    this.commandsMessage.set(Whoami.name, Whoami);
    this.commandsMessage.set(Clearance.name, Clearance);
    this.commandsMessage.set(PovCommand.name, PovCommand);

    const commandsBody = [
      Ban.slashCommand.toJSON(),
      Whoami.slashCommand.toJSON(),
      Clearance.slashCommand.toJSON(),
      PovCommand.slashCommand.toJSON(),
    ];

    await this.rest.put(Routes.applicationCommands(this.client.user.id), {
      body: commandsBody,
    });
  }

  private async seed() {
    // TODO add binding
    await this.guildsModel.updateMany({}, {});
  }

  async bot(): Promise<void> {
    try {
      this.client.on(Events.ClientReady, async () =>
        this.logger.log(`Logged in as ${this.client.user.tag}!`),
      );

      this.client.on(Events.GuildCreate, async (guild) => {
        try {
          await indexGuildByRepository(
            this.guildsModel,
            guild,
            this.client.user.id,
          );
        } catch (errorOrException) {
          this.logger.error(`${Events.GuildCreate}: ${errorOrException}`);
        }
      });

      this.client.on(
        Events.InteractionCreate,
        async (interaction): Promise<void> => {
          const isButton = interaction.isButton();
          const isCommand = interaction.isCommand();
          if (isButton) {
            // TODO check permissions

            const banEntity = await this.bansModel.findOne<Bans>({
              userId: interaction.customId,
            });

            if (banEntity) {
              /**
               * @description Receive state of button clicked
               * @description By each discord representative
               */
              const buttonClicked = await this.redisService.smembers(
                `${interaction.customId}:button`,
              );

              if (!buttonClicked.includes(userPermissionsEntity.guildId)) {
                await this.redisService.sadd(
                  `${interaction.customId}:button`,
                  userPermissionsEntity.guildId,
                );

                const emojiEdit = this.client.emojis.cache.get(
                  DISCORD_CLASS_HALLS.get(userPermissionsEntity.guildId),
                );

                const [embed] = interaction.message.embeds;
                const newEmbed = new EmbedBuilder(embed).addFields({
                  name: '\u200B',
                  value: `${emojiEdit} - ✅`,
                  inline: true,
                });

                await interaction.update({ embeds: [newEmbed] });

                const guildCacheExists = this.client.guilds.cache.has(
                  userPermissionsEntity.guildId,
                );
                if (!guildCacheExists) {
                  this.logger.log(
                    `Permissions for user ${interaction.user.id} is exists, but guild ${userPermissionsEntity.guildId} doesn't provided in cache`,
                  );
                  this.logger.log(
                    `Trying to fetch guild ${userPermissionsEntity.guildId}...`,
                  );

                  try {
                    const guild = await this.client.guilds.fetch(
                      userPermissionsEntity.guildId,
                    );
                    await guild.members.ban(interaction.customId, {
                      deleteMessageSeconds: 604800,
                    });
                    await interaction.reply({
                      ephemeral: true,
                      content: `Как представитель дискорда с ID ${userPermissionsEntity.guildId} вы забанили пользователя с ID ${interaction.customId}`,
                    });
                  } catch (errorOrException) {
                    this.logger.error(
                      `Unable to fetch guild ${userPermissionsEntity.guildId} on ban stage, seems it's Missing Access or out of our reach`,
                    );
                    console.error(errorOrException);
                  } finally {
                    await interaction.reply({
                      ephemeral: true,
                      content: `Представитель дискорда с ID ${userPermissionsEntity.guildId} забанил пользователя с ID ${interaction.customId}`,
                    });
                  }
                } else {
                  const guild = this.client.guilds.cache.get(
                    userPermissionsEntity.guildId,
                  );
                  try {
                    await guild.members.ban(interaction.customId, {
                      deleteMessageSeconds: 604800,
                    });
                    await interaction.reply({
                      ephemeral: true,
                      content: `Как представитель дискорда с ID ${userPermissionsEntity.guildId} вы забанили пользователя с ID ${interaction.customId}`,
                    });
                  } catch (errorOrException) {
                    this.logger.error(
                      `Unable to ban user ${interaction.customId} at guild ${userPermissionsEntity.guildId} on ban stage, seems it's Missing Access or out of our reach`,
                    );
                    console.error(errorOrException);
                  }
                }
              } else {
                await interaction.reply({
                  ephemeral: true,
                  content: `Как представитель дискорда с ID ${userPermissionsEntity.guildId} вы уже забанили пользователя с ID ${interaction.customId}`,
                });
              }
            }
          }

          if (isCommand) {
            try {
              const command = this.commandsMessage.get(interaction.commandName);
              if (!command) {
                throw new Error(
                  `Команда ${interaction.commandName} не найдена`,
                );
              }

              const hasPermission = [Ban.name, VoteUnban.name, Clearance.name];

              if (
                this.localStorage.userPermissionStorage.has(
                  interaction.user.id,
                ) &&
                hasPermission.includes(command.name)
              ) {
                await interaction.reply({
                  ephemeral: true,
                  content: `У вас нет доступа к использованию команд`,
                });
                return;
              }

              await command.executeInteraction({
                interaction,
                redis: this.redisService,
                logger: this.logger,
              });
            } catch (errorException) {
              this.logger.error(errorException);
              await interaction.reply({
                content: errorException,
                ephemeral: true,
              });
            }
          }
        },
      );

      this.client.on(Events.GuildBanAdd, async (ban: GuildBan) => {
        try {
          const guildBan = await ban.fetch();

          const eventDto = EventDto.fromGuildBan(guildBan, Events.GuildBanAdd);
          await this.amqpConnection.publish<EventDto>(
            EVENTS_QUEUE,
            'test-test',
            eventDto,
          );

          const isBanTrigger =
            guildBan.reason &&
            DISCORD_REASON_BANS.has(guildBan.reason.toLowerCase());

          if (!isBanTrigger) {
            this.logger.warn(`Guild ban doesn't have appropriate reason`);
            return;
          }

          const banEntity = await this.bansModel.findOne<Bans>({
            userId: guildBan.user.id,
          });

          const banOnGuildIcon = this.client.emojis.cache.get(
            DISCORD_CLASS_HALLS.get(guildBan.guild.id),
          );

          const [logsChannel, coreChannel] = await Promise.all([
            this.channelsModel.findOne<Channels>({
              tags: { $all: ['Rainy', 'logs'] },
            }),
            this.channelsModel.findOne<Channels>({
              tags: { $all: ['Rainy', 'core'] },
            }),
          ]);

          const [channelBanLogs, channelCore] = [
            this.client.channels.cache.get(logsChannel._id) as TextChannel,
            this.client.channels.cache.get(coreChannel._id) as TextChannel,
          ];
          if (channelBanLogs && channelBanLogs.isTextBased) {
            await channelBanLogs.send(
              `${guildBan.user.id} - ${banOnGuildIcon} ${guildBan.guild.name}`,
            );
          }

          const emoji = this.client.emojis.cache.get(
            DISCORD_CLASS_HALLS.get(guildBan.guild.id),
          );

          if (!banEntity) {
            const embed = banEmbed(guildBan, emoji);
            const buttons = banButtons(guildBan, logsChannel);

            const message = await channelCore.send({
              content: `⁣!ban ${guildBan.user.id} CrossBan⁣`,
              embeds: [embed],
              components: [buttons],
            });

            await this.bansModel.create({
              userId: guildBan.user.id,
              guildId: guildBan.guild.id,
              reason: guildBan.reason,
              votingMessageId: message.id,
            });
          } else {
            const message = await channelCore.messages.fetch(
              banEntity.votingMessageId,
            );

            const isMessageExists =
              message && message.embeds && message.embeds.length;

            if (!isMessageExists)
              new Error(
                `Unable to fetch exists voting message ${banEntity.votingMessageId}`,
              );

            const [embed] = message.embeds;

            const updatedEmbed = new EmbedBuilder(embed).addFields({
              name: '\u200B',
              value: `${emoji} - ✅`,
              inline: true,
            });

            await message.edit({ embeds: [updatedEmbed] });

            banEntity.votingGuildRepresentatives.addToSet(guildBan.guild.id);
            await banEntity.save();
          }
        } catch (errorOrException) {
          this.logger.error(`${Events.GuildBanAdd}: ${errorOrException}`);
        }
      });

      this.client.on(Events.GuildBanRemove, async (ban) => {
        try {
          // TODO
          if (!!(await this.redisService.get(ban.user.id))) {
            await this.redisService.del(ban.user.id);
            await this.redisService.del(`${ban.user.id}:button`);
          }
        } catch (errorOrException) {
          this.logger.error(`${Events.GuildBanRemove}: ${errorOrException}`);
        }
      });

      this.client.on(Events.GuildMemberAdd, async (guildMember) => {
        try {
          // TODO rethink - remove
          if (DISCORD_SERVER_RENAME.has(guildMember.guild.id)) {
            const usernameBefore = guildMember.user.username;
            const username = guildMember.user.username
              .toLowerCase()
              .replace('_', '')
              .replace('.', '')
              .replace(/\d/g, '');

            const displayName = capitalizeFirstLetter(username);

            await guildMember.setNickname(displayName);
            this.logger.log(
              `Rename user from ${usernameBefore} to ${displayName}`,
            );
          }
        } catch (errorOrException) {
          this.logger.error(`${Events.GuildMemberAdd}: ${errorOrException}`);
        }
      });
    } catch (errorOrException) {
      this.logger.error(`Rainy: ${errorOrException}`);
    }
  }
}
