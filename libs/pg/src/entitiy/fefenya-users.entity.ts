import { ENTITY_ENUM } from '@cmnw/pg';
import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  PrimaryColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity({ name: ENTITY_ENUM.FEFENYA_USERS })
export class FefenyaUsersEntity {
  @PrimaryColumn('bigint')
  id: string;

  @Column({
    nullable: true,
    default: null,
    type: 'varchar',
    name: 'name',
    length: 128,
  })
  name?: string;

  @Index()
  @Column({
    nullable: false,
    type: 'varchar',
    name: 'guild_id',
  })
  guildId: string;

  @Column({
    nullable: false,
    default: 0,
    type: 'int',
    name: 'count',
  })
  count: number;

  @CreateDateColumn({
    type: 'timestamp with time zone',
    name: 'created_at',
    nullable: true,
    default: () => 'CURRENT_TIMESTAMP',
  })
  createdAt?: Date;

  @UpdateDateColumn({
    type: 'timestamp with time zone',
    name: 'updated_at',
    nullable: true,
    default: () => 'CURRENT_TIMESTAMP',
  })
  updatedAt?: Date;
}
