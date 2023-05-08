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
      ],
      order: {
        position: 'ASC',
      },
    });

    console.log(this.blackTempleRoles);
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
        const [memberRole, boostRole, serviceRole] = this.blackTempleRoles;
        const hasBoostRole =
          newMember.roles.cache.has(boostRole.id) &&
          !oldMember.roles.cache.has(boostRole.id);

        const hasPermissions =
          oldMember.guild.members.me.permissions.has(
            PermissionsBitField.Flags.ManageRoles,
            false,
          ) && memberRole.position > serviceRole.position;

        if (!hasPermissions) {
          this.logger.warn(
            `${this.client.user.username} has no permission to manage roles!`,
          );
          return;
        }

        await oldMember.fetch();

        if (hasBoostRole) {
          await oldMember.roles.add(serviceRole.id);
        } else {
          await oldMember.roles.remove(serviceRole.id);
        }
      },
    );
  }
}
