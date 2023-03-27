import { Module } from '@nestjs/common';
import { PepaChatGptService } from './pepa-chat-gpt.service';
import { ScheduleModule } from '@nestjs/schedule';
import { TypeOrmModule } from '@nestjs/typeorm';
import { postgresConfig, redisConfig } from '@cmnw/config';
import { RedisModule } from '@nestjs-modules/ioredis';
import { BullModule } from '@anchan828/nest-bullmq';
import { chatQueue } from '@cmnw/shared';
import {
  ChannelsEntity,
  CoreUsersEntity,
  FefenyaEntity,
  GuildsEntity,
  PermissionsEntity,
  RolesEntity,
  UserPermissionsEntity,
  UsersEntity,
} from '@cmnw/pg';

@Module({
  imports: [
    ScheduleModule.forRoot(),
    TypeOrmModule.forRoot(postgresConfig),
    TypeOrmModule.forFeature([
      FefenyaEntity,
      ChannelsEntity,
      GuildsEntity,
      UsersEntity,
      RolesEntity,
      CoreUsersEntity,
      PermissionsEntity,
      UserPermissionsEntity,
    ]),
    RedisModule.forRoot({
      config: {
        host: redisConfig.host,
        port: redisConfig.port,
        password: redisConfig.password,
      },
    }),
    BullModule.forRoot({
      options: {
        connection: {
          host: redisConfig.host,
          port: redisConfig.port,
          password: redisConfig.password,
        },
      },
    }),
    BullModule.registerQueue({
      queueName: chatQueue.name,
      options: chatQueue.options,
    }),
  ],
  controllers: [],
  providers: [PepaChatGptService],
})
export class PepaChatGptModule {}
