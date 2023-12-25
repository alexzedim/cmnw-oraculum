import { Module } from '@nestjs/common';
import { RivenService, ChatService } from './services';
import { StorageService } from './services/storage.service';
import { ScheduleModule } from '@nestjs/schedule';
import { MongooseModule } from '@nestjs/mongoose';
import { RedisModule } from '@nestjs-modules/ioredis';
import { RabbitMQModule } from '@golevelup/nestjs-rabbitmq';
import { S3Module } from 'nestjs-s3';
import {
  mongoConfig,
  rabbitConfig,
  redisConfig,
  yandexConfig,
} from '@cmnw/config';

import {
  Channels,
  ChannelsSchema,
  Guilds,
  GuildsSchema,
  Keys,
  KeysSchema,
  Messages,
  MessagesSchema,
  Roles,
  RolesSchema,
  Users,
  UsersSchema,
} from '@cmnw/mongo';

@Module({
  imports: [
    ScheduleModule.forRoot(),
    MongooseModule.forRoot(mongoConfig.connectionString),
    MongooseModule.forFeature([
      { name: Keys.name, schema: KeysSchema },
      { name: Guilds.name, schema: GuildsSchema },
      { name: Users.name, schema: UsersSchema },
      { name: Channels.name, schema: ChannelsSchema },
      { name: Roles.name, schema: RolesSchema },
      { name: Messages.name, schema: MessagesSchema },
    ]),
    RedisModule.forRoot({
      config: {
        host: redisConfig.host,
        port: redisConfig.port,
        password: redisConfig.password,
      },
    }),
    RabbitMQModule.forRoot(RabbitMQModule, {
      uri: rabbitConfig.uri,
      connectionInitOptions: { wait: true },
    }),
    S3Module.forRoot({
      config: {
        credentials: {
          accessKeyId: yandexConfig.key,
          secretAccessKey: yandexConfig.secret,
        },
        region: 'ru-central1',
        endpoint: 'https://storage.yandexcloud.net',
        forcePathStyle: true,
        // signatureVersion: 'v4',
      },
    }),
  ],
  controllers: [],
  providers: [RivenService, ChatService, StorageService],
})
export class RivenModule {}
