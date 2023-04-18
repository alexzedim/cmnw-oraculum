import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import { readFileSync } from 'fs';
import { join } from 'path';
import { util } from 'config';
import { PostgresInterface } from '@cmnw/config/types';
import {
  ChannelsEntity,
  CoreUsersEntity,
  GuildsEntity,
  PepaQuestionsEntity,
  PermissionsEntity,
  RolesEntity,
  UserPermissionsEntity,
  UsersEntity,
} from '@cmnw/pg';

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
    PermissionsEntity,
    RolesEntity,
    CoreUsersEntity,
    UserPermissionsEntity,
    PepaQuestionsEntity,
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
