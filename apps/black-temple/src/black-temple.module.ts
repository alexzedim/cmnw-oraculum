import { Module } from '@nestjs/common';
import { BlackTempleService } from './black-temple.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { postgresConfig } from '@cmnw/config';
import { CoreUsersEntity, GuildsEntity, RolesEntity } from '@cmnw/pg';

@Module({
  imports: [
    TypeOrmModule.forRoot(postgresConfig),
    TypeOrmModule.forFeature([CoreUsersEntity, RolesEntity, GuildsEntity]),
  ],
  controllers: [],
  providers: [BlackTempleService],
})
export class BlackTempleModule {}
