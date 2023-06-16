import {
  Inject,
  Injectable,
  Logger,
  NotFoundException,
  OnApplicationBootstrap,
} from '@nestjs/common';

import {
  ChannelsEntity,
  CoreUsersEntity,
  GuildsEntity,
  UsersEntity,
} from '@cmnw/pg';

import { capitalizeFirstLetter } from 'normalize-text';
import { InjectRedis, Redis } from '@nestjs-modules/ioredis';
import { REST } from '@discordjs/rest';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ButtonStyle, GatewayIntentBits, Routes } from 'discord-api-types/v10';
import { MessageActionRowComponentBuilder } from '@discordjs/builders';
import { Ban, Clearance, PovCommand, VoteUnban, Whoami } from './commands';
import { SeederService } from './seeder/seeder.service';

import {
  DISCORD_CHANNELS_ENUM,
  DISCORD_EMOJI,
  DISCORD_REASON_BANS,
  DISCORD_SERVER_RENAME,
  ISlashCommand,
  StorageTypes,
} from '@cmnw/shared';

import {
  Client,
  TextChannel,
  Collection,
  ButtonBuilder,
  ChannelType,
  EmbedBuilder,
  ActionRowBuilder,
  Events,
  Partials,
} from 'discord.js';

@Injectable()
export class RainyService implements OnApplicationBootstrap {
  private client: Client;

  private rainyUser: CoreUsersEntity;

  private logsChannel: TextChannel;

  private coreChannel: TextChannel;

  private localStorage: StorageTypes;

  private commandsMessage: Collection<string, ISlashCommand> = new Collection();

  private commandSlash = [];

  private readonly rest = new REST({ version: '10' });

  private readonly logger = new Logger(RainyService.name, { timestamp: true });

  constructor(
    @InjectRedis()
    private readonly redisService: Redis,
    @Inject(SeederService)
    private readonly seederService: SeederService,
    @InjectRepository(UsersEntity)
    private readonly usersRepository: Repository<UsersEntity>,
    @InjectRepository(GuildsEntity)
    private readonly guildsRepository: Repository<GuildsEntity>,
    @InjectRepository(ChannelsEntity)
    private readonly channelsRepository: Repository<ChannelsEntity>,
    @InjectRepository(CoreUsersEntity)
    private readonly coreUsersRepository: Repository<CoreUsersEntity>,
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
      const rainyUserEntity = await this.coreUsersRepository.findOneBy({
        name: 'Rainy',
      });

      if (!rainyUserEntity) throw new NotFoundException(-'Rainy not found!');

      if (!rainyUserEntity.token)
        throw new NotFoundException('Rainy token not found!');

      this.rainyUser = rainyUserEntity;

      await this.client.login(this.rainyUser.token);

      this.rest.setToken(this.rainyUser.token);

      await this.seederService.init(this.client, false);

      this.localStorage = this.seederService.extract();
    } catch (errorOrException) {
      this.logger.error(`loadRainy: ${errorOrException}`);
    }
  }

  private async loadCommands(): Promise<void> {
    this.commandsMessage.set(Ban.name, Ban);
    this.commandSlash.push(Ban.slashCommand.toJSON());
    this.commandsMessage.set(Whoami.name, Whoami);
    this.commandSlash.push(Whoami.slashCommand.toJSON());
    this.commandsMessage.set(Clearance.name, Clearance);
    this.commandSlash.push(Clearance.slashCommand.toJSON());
    this.commandsMessage.set(PovCommand.name, PovCommand);
    this.commandSlash.push(PovCommand.slashCommand.toJSON());

    await this.rest.put(Routes.applicationCommands(this.client.user.id), {
      body: this.commandSlash,
    });
  }

  async bot(): Promise<void> {
    try {
      this.client.on(Events.ClientReady, async () =>
        this.logger.log(`Logged in as ${this.client.user.tag}!`),
      );

      const channelCoreEntity = this.localStorage.channelStorage.get(
        DISCORD_CHANNELS_ENUM.Core,
      );
      this.coreChannel = (await this.client.channels.fetch(
        channelCoreEntity.id,
      )) as TextChannel;

      if (!this.coreChannel || this.coreChannel.type !== ChannelType.GuildText)
        return;

      const channelLogsEntity = this.localStorage.channelStorage.get(
        DISCORD_CHANNELS_ENUM.Logs,
      );
      this.logsChannel = (await this.client.channels.fetch(
        channelLogsEntity.id,
      )) as TextChannel;

      if (!this.coreChannel || this.coreChannel.type !== ChannelType.GuildText)
        return;

      this.client.on(Events.GuildCreate, async (guild) => {
        try {
          await this.seederService.createGuildDiscordProfile(guild);
        } catch (errorOrException) {
          this.logger.error(`${Events.GuildCreate}: ${errorOrException}`);
        }
      });

      this.client.on(
        Events.InteractionCreate,
        async (interaction): Promise<void> => {
          /**
           * @description IF button is pressed
           */
          if (
            interaction.isButton() &&
            this.localStorage.userPermissionStorage.has(interaction.user.id)
          ) {
            const userPermissionsEntity =
              this.localStorage.userPermissionStorage.get(interaction.user.id);

            const isBanExists = !!(await this.redisService.get(
              interaction.customId,
            ));
            if (isBanExists) {
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
                  DISCORD_EMOJI.get(userPermissionsEntity.guildId),
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

          if (interaction.isCommand()) {
            try {
              const command = this.commandsMessage.get(interaction.commandName);
              if (!command) return;

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
                localStorage: this.localStorage,
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

      this.client.on(Events.GuildBanAdd, async (ban) => {
        try {
          const guildBan = await ban.fetch();

          if (
            guildBan.reason &&
            DISCORD_REASON_BANS.has(guildBan.reason.toLowerCase())
          ) {
            const banOnGuildIcon = this.client.emojis.cache.get(
              DISCORD_EMOJI.get(guildBan.guild.id),
            );

            const { id } = this.localStorage.channelStorage.get(
              DISCORD_CHANNELS_ENUM.Logs,
            );
            const channelBanLogs = await this.client.channels.fetch(id);
            if (channelBanLogs && channelBanLogs.isTextBased) {
              await (channelBanLogs as TextChannel).send(
                `${guildBan.user.id} - ${banOnGuildIcon} ${guildBan.guild.name}`,
              );
            }

            const userBanExists = await this.redisService.get(guildBan.user.id);
            if (!userBanExists) {
              const buttons = new ActionRowBuilder().addComponents(
                new ButtonBuilder()
                  .setCustomId(guildBan.user.id)
                  .setLabel('Заблокировать')
                  .setStyle(ButtonStyle.Danger),
                new ButtonBuilder()
                  .setLabel('История банов')
                  .setURL(
                    'https://discord.com/channels/474036493061718016/896513694488477767',
                  )
                  .setStyle(ButtonStyle.Secondary),
              ) as ActionRowBuilder<MessageActionRowComponentBuilder>;

              const emoji = this.client.emojis.cache.get(
                DISCORD_EMOJI.get(guildBan.guild.id),
              );

              const embed = new EmbedBuilder()
                .setDescription(
                  `**${guildBan.user.username}** заблокирован на:`,
                )
                .setColor('#2b2d31')
                .addFields({
                  name: '\u200B',
                  value: `${emoji} - ✅`,
                  inline: true,
                });

              const message = await this.coreChannel.send({
                content: `⁣!ban ${guildBan.user.id} CrossBan⁣`,
                embeds: [embed],
                components: [buttons],
              });

              await this.redisService.set(guildBan.user.id, message.id);
            } else {
              const message = await this.coreChannel.messages.fetch(
                userBanExists,
              );
              if (message && message.embeds) {
                const [embed] = message.embeds;

                const emoji = this.client.emojis.cache.get(
                  DISCORD_EMOJI.get(guildBan.guild.id),
                );

                const newEmbed = new EmbedBuilder(embed).addFields({
                  name: '\u200B',
                  value: `${emoji} - ✅`,
                  inline: true,
                });

                await message.edit({ embeds: [newEmbed] });

                await this.redisService.sadd(
                  `${guildBan.user.id}:button`,
                  guildBan.guild.id,
                );
              }
            }
          }
        } catch (errorOrException) {
          this.logger.error(`${Events.GuildBanAdd}: ${errorOrException}`);
        }
      });

      this.client.on(Events.GuildBanRemove, async (ban) => {
        try {
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
