import { readFileSync } from 'fs';
import config from 'config';
import { decrypt } from '@cmnw/core';
import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import { PostgresConfigInterface } from '@cmnw/config/types';
import {
  ChannelsEntity,
  CoreUsersEntity,
  GuildsEntity,
  PermissionsEntity,
  PepaIdentityEntity,
  RolesEntity,
  UserPermissionsEntity,
  UsersEntity,
} from '@cmnw/pg';

const POSTGRES_CONFIG = config.get<PostgresConfigInterface>('postgres');

export const postgresConfig: TypeOrmModuleOptions = {
  type: 'postgres',
  host: decrypt(POSTGRES_CONFIG.host),
  port: POSTGRES_CONFIG.port,
  username: decrypt(POSTGRES_CONFIG.username),
  password: decrypt(POSTGRES_CONFIG.password),
  database: POSTGRES_CONFIG.database,
  logging: true,
  entities: [
    ChannelsEntity,
    GuildsEntity,
    UsersEntity,
    PermissionsEntity,
    RolesEntity,
    CoreUsersEntity,
    UserPermissionsEntity,
    PepaIdentityEntity,
  ],
  synchronize: false,
  keepConnectionAlive: true,
  ssl: !!POSTGRES_CONFIG.ssl
    ? {
        ca: readFileSync(POSTGRES_CONFIG.ssl?.ca, 'utf-8'),
        key: POSTGRES_CONFIG.ssl?.key
          ? readFileSync(POSTGRES_CONFIG.ssl?.key, 'utf-8')
          : null,
        cert: POSTGRES_CONFIG.ssl?.cert
          ? readFileSync(POSTGRES_CONFIG.ssl?.cert, 'utf-8')
          : null,
      }
    : null,
};
