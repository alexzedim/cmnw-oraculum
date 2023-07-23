import { Injectable, Logger, OnApplicationBootstrap } from '@nestjs/common';

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

import Redis from 'ioredis';
import { InjectRedis } from '@nestjs-modules/ioredis';
import { RODRIGA_ENUM, formatRedisKey, loadKey } from '@cmnw/core';
import { InjectModel } from '@nestjs/mongoose';
import { Guilds, Keys, Roles } from '@cmnw/mongo';
import { Model } from 'mongoose';

@Injectable()
export class RodrigaService implements OnApplicationBootstrap {
  private readonly logger = new Logger(RodrigaService.name, {
    timestamp: true,
  });
  private client: Client;
  private blackTempleUser: Keys;
  private blackTempleGuild: Guild;
  private blackTempleRoles: Array<Roles>;
  constructor(
    @InjectRedis()
    private readonly redisService: Redis,
    @InjectModel(Keys.name)
    private readonly keysModel: Model<Keys>,
    @InjectModel(Guilds.name)
    private readonly guildsModel: Model<Guilds>,
    @InjectModel(Roles.name)
    private readonly rolesModel: Model<Roles>,
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

    this.blackTempleUser = await loadKey(this.keysModel, 'Гачикостас');

    await this.client.login(this.blackTempleUser.token);
  }

  private async bindGuild() {
    const blackTemple = await this.guildsModel.findOne<Guilds>({
      tags: 'Rodriga',
    });

    this.blackTempleGuild = this.client.guilds.cache.get(blackTemple._id);

    this.blackTempleRoles = await this.rolesModel
      .find<Roles>({
        $and: [
          {
            $or: [
              { name: 'Поддержка сервера' },
              { name: 'Member' },
              { name: 'Отряд токси' },
              { name: 'Иллидари' },
              { name: 'Тень Акамы' },
              { name: 'Совет Иллидари' },
            ],
          },
          { guildId: this.blackTempleGuild.id },
        ],
      })
      .sort({ position: 1 });

    console.log(this.blackTempleRoles);
  }

  private async bot() {
    this.client.on(Events.ClientReady, async () => {
      this.logger.log(`Logged in as ${this.client.user.tag}!`);
      await this.bindGuild();
    });

    this.client.on(
      Events.GuildMemberUpdate,
      async (
        oldMember: GuildMember | PartialGuildMember,
        newMember: GuildMember,
      ) => {
        const key = formatRedisKey(RODRIGA_ENUM.GUILD_MEMBER, 'RODRIGA');
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
