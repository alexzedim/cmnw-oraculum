import { Model } from 'mongoose';
import { Voting } from '@cmnw/mongo';

export const isVotingActive = async (model: Model<Voting>, id: string) => {
  return model.findOne<Voting | undefined>({ id });
};
