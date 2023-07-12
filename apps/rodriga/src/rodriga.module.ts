import { Module } from '@nestjs/common';
import { RodrigaService } from './rodriga.service';
import { mongoConfig, redisConfig } from '@cmnw/config';
import { RedisModule } from '@nestjs-modules/ioredis';
import { MongooseModule } from '@nestjs/mongoose';
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
    RedisModule.forRoot({
      config: {
        host: redisConfig.host,
        port: redisConfig.port,
        password: redisConfig.password,
      },
    }),
    MongooseModule.forRoot(mongoConfig.connectionString),
    MongooseModule.forFeature([
      { name: Keys.name, schema: KeysSchema },
      { name: Guilds.name, schema: GuildsSchema },
      { name: Users.name, schema: UsersSchema },
      { name: Channels.name, schema: ChannelsSchema },
      { name: Roles.name, schema: RolesSchema },
    ]),
  ],
  controllers: [],
  providers: [RodrigaService],
})
export class RodrigaModule {}
