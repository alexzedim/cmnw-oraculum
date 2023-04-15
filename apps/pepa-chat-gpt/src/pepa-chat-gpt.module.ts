import { Module } from '@nestjs/common';
import { PepaChatGptService } from './pepa-chat-gpt.service';
import { ScheduleModule } from '@nestjs/schedule';
import { TypeOrmModule } from '@nestjs/typeorm';
import { postgresConfig, rabbitConfig, redisConfig } from '@cmnw/config';
import { RedisModule } from '@nestjs-modules/ioredis';
import { RabbitMQModule } from '@golevelup/nestjs-rabbitmq';
import { ChatService } from './chat/chat.service';
import { oraculumQueue } from '@cmnw/shared';
import { CoreUsersEntity, UsersEntity } from '@cmnw/pg';

@Module({
  imports: [
    ScheduleModule.forRoot(),
    TypeOrmModule.forRoot(postgresConfig),
    TypeOrmModule.forFeature([UsersEntity, CoreUsersEntity]),
    RedisModule.forRoot({
      config: {
        host: redisConfig.host,
        port: redisConfig.port,
        password: redisConfig.password,
      },
    }),
    RabbitMQModule.forRoot(RabbitMQModule, {
      exchanges: [oraculumQueue],
      uri: rabbitConfig.uri,
      connectionInitOptions: { wait: true },
    }),
  ],
  controllers: [],
  providers: [PepaChatGptService, ChatService],
})
export class PepaChatGptModule {}
