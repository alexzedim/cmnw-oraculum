import { Model } from 'mongoose';
import { Fefenya } from '@cmnw/mongo';
import { STATUS_ENUM } from '@cmnw/core/enums';
import { GuildMember } from 'discord.js';
import { randomMixMax } from '@cmnw/core/utils';

export const resetContestByGuildId = async (
  model: Model<Fefenya>,
  guildId: string,
) => {
  await model.updateMany({ guildId }, { status: STATUS_ENUM.DISABLED });
};

export const setContestUserActive = async (
  model: Model<Fefenya>,
  userId: string,
  username: string,
  guildId: string,
) => {
  const fefenya = await model.findOne<Fefenya>({ userId });
  if (!fefenya) {
    return await model.create({
      userId: userId,
      username,
      guildId,
      status: STATUS_ENUM.ACTIVE,
      count: 0,
    });
  } else {
    return model.findOneAndUpdate(
      { userId },
      {
        userId: userId,
        username,
        guildId,
        status: STATUS_ENUM.ACTIVE,
      },
      { upsert: true, new: true },
    );
  }
};

export const indexFefenyas = async (
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
      status: STATUS_ENUM.ACTIVE,
    });
  }

  await userFefenya.save();
};

export const pickRandomFefenya = async (
  usersFefenyaModel: Model<Fefenya>,
  guildId: string,
) => {
  const int = await usersFefenyaModel.count({
    status: STATUS_ENUM.ACTIVE,
    guildId: guildId,
  });

  const randomInt = randomMixMax(0, int - 2);

  const userFefenya = await usersFefenyaModel
    .findOne<Fefenya>({
      status: STATUS_ENUM.ACTIVE,
      guildId: guildId,
    })
    .skip(randomInt);

  const { count: incr } = userFefenya;

  return usersFefenyaModel.findByIdAndUpdate(userFefenya._id, {
    count: incr + 1,
  });
};
