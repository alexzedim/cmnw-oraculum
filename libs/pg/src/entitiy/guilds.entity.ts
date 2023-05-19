import {
  ChannelsEntity,
  RolesEntity,
  ENTITY_ENUM,
  UserPermissionsEntity,
  UsersEntity,
  VECTOR_ENUM,
} from '@cmnw/pg';

import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity({ name: ENTITY_ENUM.GUILDS })
export class GuildsEntity {
  @PrimaryColumn('bigint')
  id: string;

  @Column({
    nullable: false,
    type: 'varchar',
    length: 128,
  })
  name: string;

  @Column({
    nullable: true,
    default: null,
    type: 'varchar',
    name: 'icon',
    length: 128,
  })
  icon?: string;

  @Column({
    nullable: false,
    type: 'bigint',
    name: 'owner_id',
  })
  ownerId: string;

  @ManyToOne(() => UsersEntity, (user: UsersEntity) => user.id)
  @JoinColumn({ name: 'owner_id' })
  ownerUser: UsersEntity;

  @OneToMany(() => ChannelsEntity, (channel: ChannelsEntity) => channel.guild)
  channels: ChannelsEntity[];

  @OneToMany(() => RolesEntity, (roles: RolesEntity) => roles.guild)
  roles: RolesEntity[];

  @OneToMany(
    () => UserPermissionsEntity,
    (userPermissions) => userPermissions.guild,
  )
  userPermissions: UserPermissionsEntity[];

  @Column({
    nullable: true,
    name: 'members_number',
    type: 'int',
  })
  membersNumber?: number;

  @Column({
    default: VECTOR_ENUM.UNCLASSIFIED,
    enum: VECTOR_ENUM,
    nullable: false,
    type: 'enum',
    name: 'vector',
  })
  vector?: string;

  @Column({
    array: true,
    nullable: true,
    type: 'character varying',
  })
  tags: string[];

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
