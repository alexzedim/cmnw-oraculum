import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryColumn,
  UpdateDateColumn,
} from 'typeorm';

import { ENTITY_ENUM } from '@cmnw/pg/enum';

@Entity({ name: ENTITY_ENUM.PEPA_QUESTIONS })
export class PepaQuestionsEntity {
  @PrimaryColumn('bigint')
  id: string;

  @Column({
    default: null,
    nullable: true,
    type: 'bigint',
    name: 'user_id',
  })
  userId?: string;

  @Column({
    default: null,
    nullable: true,
    type: 'varchar',
    length: 128,
    name: 'username',
  })
  username?: string;

  @Column({
    nullable: false,
    type: 'text',
    name: 'question',
  })
  question: string;

  @Column({
    default: null,
    nullable: true,
    type: 'varchar',
    length: 128,
    name: 'type',
  })
  type?: string;

  @Column({
    name: 'is_answered',
    nullable: true,
    default: false,
  })
  is_answered?: boolean;

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
