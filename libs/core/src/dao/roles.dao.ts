import { Roles } from '@cmnw/mongo';
import { Model } from 'mongoose';
import { isDurationNotPass } from '@cmnw/core/utils';
import { Role, SnowflakeUtil } from 'discord.js';
import { DateTime } from 'luxon';

export const getRoleByTags = async (
  model: Model<Roles>,
  guildId: string,
  tags: Array<string>,
) =>
  await model.findOne<Roles>({
    guildId: guildId,
    tags: {
      $all: tags,
    },
  });

export const bindRoleTags = async (
  model: Model<Roles>,
  guildId: string,
  roleId: string,
  tags: Array<string>,
) => {
  const role = await model.findOne<Roles>({
    guildId: guildId,
    tags: { $all: tags },
  });

  if (!role) {
    return model.findOneAndUpdate<Roles>(
      {
        _id: roleId,
        guildId: guildId,
      },
      {
        $addToSet: { tags: tags },
      },
    );
  }

  const isUnbind = role._id !== roleId;
  if (isUnbind) {
    role.tags.pull(tags);
    role.markModified('tags');
    await role.save();
  }

  return model.findOneAndUpdate(
    {
      _id: roleId,
      guildId: guildId,
    },
    { $addToSet: { tags: tags } },
  );
};

export const indexRoles = async (
  model: Model<Roles>,
  guildId: string,
  role: Role,
  scannedBy: string,
) => {
  let roleEntity = await model.findById<Roles>(role.id);
  if (roleEntity) {
    if (isDurationNotPass(roleEntity.updatedAt)) {
      return;
    }

    roleEntity.name = role.name;
    roleEntity.bitfield = role.permissions.bitfield.toString();
    roleEntity.isMentionable = role.mentionable;
    roleEntity.position = role.rawPosition;
    roleEntity.updatedBy = scannedBy;
  }

  if (!roleEntity) {
    roleEntity = new model({
      _id: role.id,
      name: role.name,
      guildId: guildId,
      bitfield: role.permissions.bitfield.toString(),
      isMentionable: role.mentionable,
      position: role.rawPosition,
      scannedAt: new Date(),
      scannedBy: scannedBy,
      createdAt: DateTime.fromMillis(
        SnowflakeUtil.timestampFrom(role.id),
      ).toJSDate(),
    });
  }

  await roleEntity.save();
};
