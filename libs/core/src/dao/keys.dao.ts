import { FilterQuery, Model } from 'mongoose';
import { Keys } from 'cmnw/mongo';
import { STATUS_ENUM } from '@cmnw/core/enums';

export async function loadKey(
  model: Model<Keys>,
  name: string,
  forceTaken = true,
) {
  const findOneBy: FilterQuery<Keys> = { name: name };

  if (!forceTaken) {
  }

  const key = await model.findOne<Keys>(findOneBy);

  if (!key) throw new Error(`${name} not found!`);

  if (!key.token) throw new Error(`Token for ${name} not found!`);

  return key;
}

export async function updateKey(model: Model<Keys>, key: Keys) {
  await model.updateOne({ _id: key._id }, key);
}

export async function releaseKey(model: Model<Keys>, key: Keys) {
  await model.updateOne(
    { _id: key._id },
    {
      status: STATUS_ENUM.FREE,
    },
  );
}
