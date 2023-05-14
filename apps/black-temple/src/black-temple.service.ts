import {
  Injectable,
  Logger,
  NotFoundException,
  OnApplicationBootstrap,
} from '@nestjs/common';

import {
  Client,
  Events,
  GatewayIntentBits,
  Guild,
  GuildMember,
  PartialGuildMember,
  Partials,
  PermissionsBitField,
} from 'discord.js';

import {
  CoreUsersEntity,
  GuildsEntity,
  RolesEntity,
  SUBJECT_VECTOR,
} from '@cmnw/pg';

import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { InjectRedis } from '@nestjs-modules/ioredis';
import Redis from 'ioredis';
import {
  BLACK_TEMPLE_ENUM,
  formatRedisKey,
  PEPA_CHAT_KEYS,
} from '@cmnw/shared';

@Injectable()
export class BlackTempleService implements OnApplicationBootstrap {
  private readonly logger = new Logger(BlackTempleService.name, {
    timestamp: true,
  });
  private client: Client;
  private blackTempleUser: CoreUsersEntity;
  private blackTempleGuild: Guild;
  private blackTempleRoles: Array<RolesEntity>;
  constructor(
    @InjectRedis()
    private readonly redisService: Redis,
    @InjectRepository(CoreUsersEntity)
    private readonly coreUsersRepository: Repository<CoreUsersEntity>,
    @InjectRepository(RolesEntity)
    private readonly rolesRepository: Repository<RolesEntity>,
    @InjectRepository(GuildsEntity)
    private readonly guildsRepository: Repository<GuildsEntity>,
  ) {}
  async onApplicationBootstrap() {
    await this.loadBot();
    await this.bot();
  }

  private async loadBot() {
    this.client = new Client({
      partials: [Partials.User, Partials.GuildMember],
      intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMembers],
      presence: {
        status: 'online',
      },
    });

    const blackTempleUserEntity = await this.coreUsersRepository.findOneBy({
      name: 'BlackTemple',
    });

    if (!blackTempleUserEntity)
      throw new NotFoundException('BlackTemple not found!');

    if (!blackTempleUserEntity.token)
      throw new NotFoundException('BlackTemple token not found!');

    this.blackTempleUser = blackTempleUserEntity;

    await this.client.login(this.blackTempleUser.token);
  }

  private async indexGuild() {
    let guildEntity = await this.guildsRepository.findOneBy({
      name: 'Black Temple',
    });

    if (!guildEntity) {
      this.blackTempleGuild =
        this.client.guilds.cache.get('736173202979422271');

      guildEntity = this.guildsRepository.create({
        id: this.blackTempleGuild.id,
        name: this.blackTempleGuild.name,
        icon: this.blackTempleGuild.icon,
        ownerId: this.blackTempleGuild.ownerId,
        membersNumber: this.blackTempleGuild.memberCount,
        vector: SUBJECT_VECTOR.CLASS_HALL,
        isWatch: false,
        scannedBy: this.client.user.id,
      });

      guildEntity = await this.guildsRepository.save(guildEntity);
    }

    this.blackTempleGuild = this.client.guilds.cache.get(guildEntity.id);

    for (const [roleId, role] of this.blackTempleGuild.roles.cache) {
      let roleEntity = await this.rolesRepository.findOneBy({
        id: roleId,
      });
      if (!roleEntity) {
        roleEntity = this.rolesRepository.create({
          id: role.id,
          name: role.name,
          guildId: role.guild.id,
          position: role.position,
          bitfield: role.permissions.bitfield.toString(),
          isMentionable: role.mentionable,
          createdBy: this.client.user.id,
        });

        await this.rolesRepository.save(roleEntity);
      } else {
        await this.rolesRepository.update(
          { id: role.id },
          {
            name: role.name,
            position: role.position,
            bitfield: role.permissions.bitfield.toString(),
            isMentionable: role.mentionable,
          },
        );
      }
    }

    this.blackTempleRoles = await this.rolesRepository.find({
      where: [
        { guildId: guildEntity.id, name: 'Поддержка сервера' },
        { guildId: guildEntity.id, name: 'Member' },
        { guildId: guildEntity.id, name: 'Отряд токси' },
        { guildId: guildEntity.id, name: 'Иллидари' },
        { guildId: guildEntity.id, name: 'Тень Акамы' },
        { guildId: guildEntity.id, name: 'Совет Иллидари' },
      ],
      order: {
        position: 'ASC',
      },
    });
  }

  private async bot() {
    this.client.on(Events.ClientReady, async () => {
      this.logger.log(`Logged in as ${this.client.user.tag}!`);
      await this.indexGuild();
    });

    this.client.on(
      Events.GuildMemberUpdate,
      async (
        oldMember: GuildMember | PartialGuildMember,
        newMember: GuildMember,
      ) => {
        const key = formatRedisKey(BLACK_TEMPLE_ENUM.GUILD_MEMBER, 'RODRIGA');
        const hasEvent = Boolean(await this.redisService.exists(key));
        if (hasEvent) {
          this.logger.warn(`${oldMember.id} has been triggered already!`);
          return;
        }

        await this.redisService.set(key, oldMember.id, 'EX', 10);

        const [
          memberRole,
          toxicSquadRole,
          serverSupportRole,
          illidariRole,
          shadowOfAkamaRole,
          illidariCouncilRole,
        ] = this.blackTempleRoles;

        const serviceRoles = [
          toxicSquadRole.id,
          illidariRole.id,
          shadowOfAkamaRole.id,
          illidariCouncilRole.id,
        ];

        const haveNowServiceRoles = serviceRoles.some((role) =>
          newMember.roles.cache.has(role),
        );
        const wasWithServiceRoles = serviceRoles.some((role) =>
          oldMember.roles.cache.has(role),
        );

        const hasBeenPromoted = haveNowServiceRoles && !wasWithServiceRoles;
        const hasBeenDemoted = !haveNowServiceRoles && wasWithServiceRoles;

        this.logger.log(
          `user: ${oldMember.id} | hasBeenPromoted: ${hasBeenPromoted} | hasBeenDemoted: ${hasBeenDemoted} `,
        );

        const hasPermissions =
          oldMember.guild.members.me.permissions.has(
            PermissionsBitField.Flags.ManageRoles,
            false,
          ) && memberRole.position < serverSupportRole.position;

        if (!hasPermissions) {
          this.logger.warn(
            `${this.client.user.username} has no permission to manage roles!`,
          );
          return;
        }

        await oldMember.fetch();

        if (hasBeenPromoted) {
          await oldMember.roles.add(serverSupportRole.id);
          this.logger.log(
            `user: ${oldMember.id} role added ${serverSupportRole.id}`,
          );
        }

        if (hasBeenDemoted) {
          await oldMember.roles.remove(serverSupportRole.id);
          this.logger.log(
            `user: ${oldMember.id} role removed ${serverSupportRole.id}`,
          );
        }
      },
    );
  }
}
