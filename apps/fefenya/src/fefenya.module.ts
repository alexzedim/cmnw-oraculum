import { Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';
import { FefenyaService } from './fefenya.service';
import { RedisModule } from '@nestjs-modules/ioredis';
import { mongoConfig, rabbitConfig, redisConfig } from '@cmnw/config';
import { MongooseModule } from '@nestjs/mongoose';
import { RabbitMQModule } from '@golevelup/nestjs-rabbitmq';
import {
  FefenyasSchema,
  Keys,
  KeysSchema,
  Fefenya,
  Prompts,
  Profiles,
  PromptsSchema,
  ProfilesSchema,
  Contests,
  ContestsSchema,
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
      { name: Contests.name, schema: ContestsSchema },
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
