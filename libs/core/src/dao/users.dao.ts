import { GuildMember, SnowflakeUtil, User } from 'discord.js';
import { DateTime } from 'luxon';
import { Users, UsersFefenya } from '@cmnw/mongo';
import { Model } from 'mongoose';

export const indexUser = async (
  usersModel: Model<Users>,
  user: User,
  scannedBy: string,
  scannedFrom: string,
  forceUpdate = false,
) => {
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
};

export async function indexFefenyaUser(
  usersFefenyaModel: Model<UsersFefenya>,
  guildMember: GuildMember,
) {
  let userFefenya = await usersFefenyaModel.findById<UsersFefenya>(
    guildMember.user.id,
  );
  if (userFefenya) userFefenya.username = guildMember.user.username;
  if (!userFefenya) {
    userFefenya = new usersFefenyaModel({
      _id: guildMember.user.id,
      username: guildMember.displayName,
      guildId: guildMember.guild.id,
      count: 0,
    });
  }

  await userFefenya.save();
}
