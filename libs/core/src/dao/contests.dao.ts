import { Model } from 'mongoose';
import { Contests } from '@cmnw/mongo';

export const buildContest = async (
  model: Model<Contests>,
  guildId: string,
  channelId: string,
  title: string,
  gameMakerId: string,
  roleId: string,
) =>
  await model.findOneAndUpdate<Contests>(
    { guildId },
    {
      guildId,
      channelId,
      title,
      roleId,
      gameMakerId,
      // TODO blockId
      position: 1,
    },
    { upsert: true, new: true },
  );

export const getContest = async (model: Model<Contests>, guildId: string) =>
  model.findOne<Contests>({ guildId });
