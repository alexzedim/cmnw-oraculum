import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import { readFileSync } from 'fs';
import { join } from 'path';
import { util } from 'config';
import { PostgresInterface } from '@app/configuration/interfaces';
import {
  ChannelsEntity,
  CoreChannelsEntity,
  CoreGuildsEntity,
  CoreRolesEntity,
  CoreUsersEntity,
  GuildsEntity,
  MessagesEntity,
  NerEntity,
  NerMessagesEntity,
  PermissionsEntity,
  RolesEntity,
  UserPermissionsEntity,
  UsersEntity,
  InvitesEntity,
  TrafficEntity,
} from '@app/pg';

const configDir = join(__dirname, '..', '..', '..', 'config');
const { postgres }: PostgresInterface = util.loadFileConfigs(configDir);

export const postgresConfig: TypeOrmModuleOptions = {
  type: 'postgres',
  host: postgres.host,
  port: postgres.port,
  username: postgres.username,
  password: postgres.password,
  database: postgres.database,
  logging: true,
  entities: [
    ChannelsEntity,
    GuildsEntity,
    UsersEntity,
    MessagesEntity,
    NerEntity,
    PermissionsEntity,
    RolesEntity,
    CoreChannelsEntity,
    CoreGuildsEntity,
    CoreRolesEntity,
    CoreUsersEntity,
    UserPermissionsEntity,
    NerMessagesEntity,
    InvitesEntity,
    TrafficEntity,
  ],
  synchronize: false,
  keepConnectionAlive: true,
  ssl: !!postgres.ssl
    ? {
        ca: readFileSync(postgres.ssl?.ca, 'utf-8'),
        key: postgres.ssl?.key
          ? readFileSync(postgres.ssl?.key, 'utf-8')
          : null,
        cert: postgres.ssl?.cert
          ? readFileSync(postgres.ssl?.cert, 'utf-8')
          : null,
      }
    : null,
};
