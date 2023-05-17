import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

import { ENTITY_ENUM } from '@cmnw/pg/enum';

@Index('ix__prompts__name', ['name'], {})
@Entity({ name: ENTITY_ENUM.PEPA_IDENTITY })
export class PepaIdentityEntity {
  @PrimaryGeneratedColumn('uuid')
  readonly uuid: string;

  @Column({
    default: null,
    nullable: true,
    type: 'varchar',
    length: 128,
    name: 'name',
  })
  name?: string;

  @Column({
    default: null,
    nullable: true,
    type: 'varchar',
    name: 'username',
  })
  username?: string;

  @Column({
    default: null,
    nullable: true,
    type: 'varchar',
    length: 512,
    name: 'description',
  })
  description?: string;

  @Column({
    default: null,
    nullable: true,
    type: 'varchar',
    name: 'avatar',
  })
  avatar?: string;

  @Column({
    type: 'bytea',
    nullable: true,
    name: 'image',
  })
  image?: Uint8Array;

  @Column({
    type: 'varchar',
    length: 218,
    nullable: true,
    name: 'status',
  })
  status: string;

  @Column({
    nullable: false,
    type: 'text',
    name: 'prompt',
  })
  prompt: string;

  @Column({
    type: 'integer',
    nullable: true,
    default: null,
  })
  version?: number;

  @Column({
    default: null,
    nullable: true,
    type: 'varchar',
    length: 128,
    name: 'gender',
  })
  gender?: string;

  @Column({
    array: true,
    nullable: true,
    type: 'character varying',
    name: 'personality',
  })
  personality?: string[];

  @Column({
    type: 'integer',
    nullable: false,
    default: 0,
    name: 'temperature',
  })
  temperature: number;

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
