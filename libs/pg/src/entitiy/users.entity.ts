import {
  GuildsEntity,
  ENTITY_ENUM,
  UserPermissionsEntity,
  CoreUsersEntity,
} from '@cmnw/pg';

import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  OneToMany,
  OneToOne,
  PrimaryColumn,
  UpdateDateColumn,
} from 'typeorm';

@Index('ix__users__name', ['name'], {})
@Entity({ name: ENTITY_ENUM.USERS })
export class UsersEntity {
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

  @Column({
    type: 'integer',
    nullable: true,
    default: null,
  })
  discriminator?: number;

  @Column({
    nullable: true,
    default: 'Unknown#0000',
    type: 'varchar',
    name: 'username',
    length: 128,
  })
  username?: string;

  @Column({
    nullable: true,
    default: null,
    type: 'varchar',
    name: 'avatar',
    length: 128,
  })
  avatar?: string;

  @Column({
    nullable: true,
    default: null,
    type: 'varchar',
    name: 'battle_tag',
    length: 128,
  })
  battleTag?: string;

  @Column({
    array: true,
    nullable: true,
    type: 'character varying',
  })
  tags: string[];

  @OneToMany(() => GuildsEntity, (guild: GuildsEntity) => guild.ownerUser)
  @JoinColumn({ name: 'id' })
  ownerGuilds: GuildsEntity[];

  @OneToMany(
    () => UserPermissionsEntity,
    (userPermissions) => userPermissions.user,
  )
  userPermissions: UserPermissionsEntity[];

  @OneToOne(() => CoreUsersEntity, (coreUser) => coreUser.user)
  coreUser?: CoreUsersEntity;

  @Column({
    default: null,
    nullable: true,
    type: 'bigint',
    name: 'scanned_by',
  })
  scannedBy?: string;

  @Column({
    default: null,
    nullable: true,
    type: 'bigint',
    name: 'updated_by',
  })
  updatedBy?: string;

  @Column({
    default: null,
    nullable: true,
    type: 'bigint',
    name: 'scanned_from',
  })
  scannedFrom?: string;

  @Column({
    default: null,
    nullable: true,
    type: 'bigint',
    name: 'updated_from',
  })
  updatedFrom?: string;

  @Column('timestamp with time zone', {
    name: 'scanned_at',
    nullable: true,
    default: () => 'CURRENT_TIMESTAMP',
  })
  scannedAt?: Date;

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
