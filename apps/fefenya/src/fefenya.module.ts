import { Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';
import { FefenyaService } from './fefenya.service';
import { RedisModule } from '@nestjs-modules/ioredis';
import { mongoConfig, redisConfig } from '@cmnw/config';
import { MongooseModule } from '@nestjs/mongoose';
import {
  Channels,
  ChannelsSchema,
  FefenyaUsersSchema,
  Keys,
  KeysSchema,
  Logs,
  LogsSchema,
  Permissions,
  PermissionsSchema,
  Users,
  UsersFefenya,
  UsersSchema,
} from '@cmnw/mongo';

@Module({
  imports: [
    ScheduleModule.forRoot(),
    MongooseModule.forRoot(mongoConfig.connectionString),
    MongooseModule.forFeature([
      { name: Keys.name, schema: KeysSchema },
      { name: UsersFefenya.name, schema: FefenyaUsersSchema },
      { name: Users.name, schema: UsersSchema },
      { name: Permissions.name, schema: PermissionsSchema },
      { name: Channels.name, schema: ChannelsSchema },
      { name: Logs.name, schema: LogsSchema },
    ]),
    RedisModule.forRoot({
      config: {
        host: redisConfig.host,
        port: redisConfig.port,
        password: redisConfig.password,
      },
    }),
  ],
  controllers: [],
  providers: [FefenyaService],
})
export class FefenyaModule {}
