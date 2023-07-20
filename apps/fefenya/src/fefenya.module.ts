import { Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';
import { FefenyaService } from './fefenya.service';
import { RedisModule } from '@nestjs-modules/ioredis';
import { mongoConfig, rabbitConfig, redisConfig } from '@cmnw/config';
import { MongooseModule } from '@nestjs/mongoose';
import { RabbitMQModule } from '@golevelup/nestjs-rabbitmq';
import {
  Channels,
  ChannelsSchema,
  FefenyasSchema,
  Keys,
  KeysSchema,
  Event,
  EventsSchema,
  Permissions,
  PermissionsSchema,
  Users,
  Fefenya,
  UsersSchema,
  Prompts,
  Profiles,
  PromptsSchema,
  ProfilesSchema,
} from '@cmnw/mongo';

@Module({
  imports: [
    ScheduleModule.forRoot(),
    MongooseModule.forRoot(mongoConfig.connectionString),
    MongooseModule.forFeature([
      { name: Keys.name, schema: KeysSchema },
      { name: Prompts.name, schema: PromptsSchema },
      { name: Profiles.name, schema: ProfilesSchema },
      { name: Fefenya.name, schema: FefenyasSchema },
      { name: Users.name, schema: UsersSchema },
      { name: Permissions.name, schema: PermissionsSchema },
      { name: Channels.name, schema: ChannelsSchema },
      { name: Event.name, schema: EventsSchema },
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
  providers: [FefenyaService],
})
export class FefenyaModule {}
