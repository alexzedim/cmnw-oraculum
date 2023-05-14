import { Module } from '@nestjs/common';
import { BlackTempleService } from './black-temple.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { postgresConfig, redisConfig } from '@cmnw/config';
import { CoreUsersEntity, GuildsEntity, RolesEntity } from '@cmnw/pg';
import { RedisModule } from '@nestjs-modules/ioredis';

@Module({
  imports: [
    TypeOrmModule.forRoot(postgresConfig),
    RedisModule.forRoot({
      config: {
        host: redisConfig.host,
        port: redisConfig.port,
        password: redisConfig.password,
      },
    }),
    TypeOrmModule.forFeature([CoreUsersEntity, RolesEntity, GuildsEntity]),
  ],
  controllers: [],
  providers: [BlackTempleService],
})
export class BlackTempleModule {}
