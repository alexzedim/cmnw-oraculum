import { Collection } from 'discord.js';
import {
  ChannelsEntity,
  FefenyaEntity,
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
  fefenyaStorage: Collection<string, FefenyaEntity>;
}
