import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ScheduleModule } from '@nestjs/schedule';
import { FefenyaService } from './fefenya.service';
import { RedisModule } from '@nestjs-modules/ioredis';
import { postgresConfig, redisConfig } from '@cmnw/config';
import {
  CoreUsersEntity,
  GuildsEntity,
  FefenyaUsersEntity,
  UsersEntity,
} from '@cmnw/pg';

@Module({
  imports: [
    ScheduleModule.forRoot(),
    TypeOrmModule.forRoot(postgresConfig),
    TypeOrmModule.forFeature([
      FefenyaUsersEntity,
      GuildsEntity,
      UsersEntity,
      CoreUsersEntity,
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
