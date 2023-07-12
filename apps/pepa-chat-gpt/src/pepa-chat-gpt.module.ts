import { Module } from '@nestjs/common';
import { PepaChatGptService } from './pepa-chat-gpt.service';
import { ScheduleModule } from '@nestjs/schedule';
import { RedisModule } from '@nestjs-modules/ioredis';
import { RabbitMQModule } from '@golevelup/nestjs-rabbitmq';
import { ChatService } from './chat/chat.service';
import { MongooseModule } from '@nestjs/mongoose';
import { mongoConfig, rabbitConfig, redisConfig } from '@cmnw/config';

import {
  Channels,
  ChannelsSchema,
  Guilds,
  GuildsSchema,
  Identity,
  IdentitySchema,
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
      { name: Identity.name, schema: IdentitySchema },
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
  ],
  controllers: [],
  providers: [PepaChatGptService, ChatService],
})
export class PepaChatGptModule {}
