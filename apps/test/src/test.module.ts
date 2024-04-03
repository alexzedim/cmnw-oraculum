import { Module } from '@nestjs/common';
import { TestService } from './test.service';
import { S3Module } from 'nestjs-s3';
import {
  mongoConfig,
  rabbitConfig,
  redisConfig,
  yandexConfig,
} from '@cmnw/config';
import { RedisModule } from '@nestjs-modules/ioredis';
import { HttpModule } from '@nestjs/axios';
import { RabbitMQModule } from '@golevelup/nestjs-rabbitmq';
import { MongooseModule } from '@nestjs/mongoose';
import { Prompts, PromptsSchema } from '@cmnw/mongo';

@Module({
  imports: [
    HttpModule.register({
      timeout: 5000,
      maxRedirects: 5,
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
    MongooseModule.forRoot(mongoConfig.connectionString),
    MongooseModule.forFeature([{ name: Prompts.name, schema: PromptsSchema }]),
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
  providers: [TestService],
})
export class TestModule {}
