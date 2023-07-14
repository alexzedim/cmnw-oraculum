import { Module } from '@nestjs/common';
import { RainyService } from './rainy.service';
import { ScheduleModule } from '@nestjs/schedule';
import { mongoConfig, rabbitConfig, redisConfig } from '@cmnw/config';
import { RedisModule } from '@nestjs-modules/ioredis';
import { MongooseModule } from '@nestjs/mongoose';
import { RabbitMQModule } from '@golevelup/nestjs-rabbitmq';
import {
  Channels,
  ChannelsSchema,
  Guilds,
  GuildsSchema,
  Keys,
  KeysSchema,
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
  providers: [RainyService],
})
export class RainyModule {}
