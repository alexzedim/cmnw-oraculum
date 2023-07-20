import { GuildMember, SnowflakeUtil, User } from 'discord.js';
import { DateTime } from 'luxon';
import { Users, Fefenya } from '@cmnw/mongo';
import { Model } from 'mongoose';
import { cryptoRandomIntBetween } from '@cmnw/core/utils';

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

export const indexFefenyaUser = async (
  usersFefenyaModel: Model<Fefenya>,
  guildMember: GuildMember,
) => {
  let userFefenya = await usersFefenyaModel.findById<Fefenya>(
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
};

export const pickRandomFefenyaUser = async (
  usersFefenyaModel: Model<Fefenya>,
  guildId: string,
) => {
  const int = await usersFefenyaModel.count({
    guildId: guildId,
  });

  const randomInt = cryptoRandomIntBetween(0, int - 1);

  const userFefenya = await usersFefenyaModel
    .findOne({
      guildId: guildId,
    })
    .skip(randomInt);

  return usersFefenyaModel.findOneAndUpdate(
    { _id: userFefenya._id },
    {
      isGotd: true,
      $inc: { count: 1 },
    },
  );
};
