import { Collection } from 'discord.js';
import {
  ChannelsEntity,
  GuildsEntity,
  RolesEntity,
  UserPermissionsEntity,
  UsersEntity,
} from '@cmnw/pg';

export interface StorageTypes {
  guildStorage: Collection<string, GuildsEntity>;
  channelStorage: Collection<string, ChannelsEntity>;
  userStorage: Collection<string, UsersEntity>;
  roleStorage: Collection<string, RolesEntity>;
  userPermissionStorage: Collection<string, UserPermissionsEntity>;
}

export interface VotingCounter {
  yes: number;
  no: number;
  voters: Set<string>;
}
