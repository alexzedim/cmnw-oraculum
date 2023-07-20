import { Model } from 'mongoose';
import { Keys } from '@cmnw/mongo';
import { ROLE_TAGS_ENUM, STATUS_ENUM } from '@cmnw/core/enums';
import { Logger } from '@nestjs/common';

export const loadKey = async (
  model: Model<Keys>,
  query: string,
  forceTake = true,
) => {
  const isTag = Object.values(ROLE_TAGS_ENUM).includes(query as ROLE_TAGS_ENUM);
  const exclude = isTag && !forceTake ? ` -${STATUS_ENUM.BIND}` : '';

  const key = await model
    .findOne<Keys>({
      $text: { $search: `${query}${exclude}` },
    })
    .sort({ indexedAt: 1 });

  if (!key) throw new Error(`${query} not found!`);

  if (!key.token) throw new Error(`Token for ${query} not found!`);

  const isAlreadyTaken = !forceTake && key.status === STATUS_ENUM.BIND;
  if (isAlreadyTaken) {
    throw new Error(`Key for ${query} already taken`);
  }

  return key;
};

export async function updateKey(
  logger: Logger,
  model: Model<Keys>,
  key: Keys,
  partialKeys: Partial<Keys>,
  isSuperVisor = false,
) {
  const vectorsDiff = key.vectors.length !== partialKeys.vectors.length;
  if (vectorsDiff) {
    const byDefault = key.vectors.join(' :: ');
    const byNew = partialKeys.vectors.join(' :: ');
    logger.warn(
      `Vector difference detected:\n Default: ${byDefault}\n New: ${byNew}`,
    );
  }

  if (partialKeys.vectors) {
    key.set('vectors', key.vectors);
    key.markModified('vectors');
  }

  if (partialKeys.tags) {
    partialKeys.tags.forEach((tag) => key.tags.addToSet(tag));
  }

  if (isSuperVisor)
    key.tags.addToSet(ROLE_TAGS_ENUM.SUPERVISOR, ROLE_TAGS_ENUM.USER);

  key.status = partialKeys.status;

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
