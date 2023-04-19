import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  PrimaryColumn,
  UpdateDateColumn,
} from 'typeorm';

import { ENTITY_ENUM } from '@cmnw/pg/enum';

@Index('ix__pepa_questions__is_answered', ['isAnswered'], {})
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
    type: 'bigint',
    name: 'channel_id',
  })
  channelId: string;

  @Column({
    nullable: false,
    type: 'text',
    name: 'question',
  })
  question: string;

  @Column({
    type: 'integer',
    nullable: false,
    default: 1,
    name: 'question_marks',
  })
  questionMarks: number;

  @Column({
    name: 'is_certain',
    nullable: true,
    default: false,
  })
  isCertain: boolean;

  @Column({
    name: 'is_answered',
    nullable: true,
    default: false,
  })
  isAnswered?: boolean;

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
