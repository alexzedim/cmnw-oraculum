import { SnowflakeUtil, User } from 'discord.js';
import { DateTime } from 'luxon';
import { Users } from 'cmnw/mongo';
import { Model } from 'mongoose';

export async function indexUser(
  usersModel: Model<Users>,
  user: User,
  scannedBy: string,
  scannedFrom: string,
  forceUpdate = false,
  // TODO isOwner = true create permission & remove from old
) {
  let userEntity = await usersModel.findOne<Users>({ _id: user.id });
  if (userEntity && !forceUpdate) return;

  if (userEntity && forceUpdate) {
    userEntity.username = user.username;
    userEntity.avatar = user.avatar;
    userEntity.updatedBy = scannedBy;
    userEntity.updatedFrom = scannedFrom;
  }

  if (!userEntity) {
    userEntity = new usersModel({
      _id: user.id,
      username: user.username,
      avatar: user.avatar,
      scannedBy: scannedBy,
      scannedFrom: scannedFrom,
      createdAt: DateTime.fromMillis(
        SnowflakeUtil.timestampFrom(user.id),
      ).toJSDate(),
    });
  }

  await userEntity.save();
}
