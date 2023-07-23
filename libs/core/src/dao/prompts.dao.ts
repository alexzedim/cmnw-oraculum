import { Model } from 'mongoose';
import { Prompts } from '@cmnw/mongo';
import { PROMPT_TYPE_ENUM } from '@cmnw/core/enums';
import { randomMixMax } from '@cmnw/core/utils';

export const getFlowDialogs = async (model: Model<Prompts>, event: string) =>
  await model.find<Prompts>({
    event,
    isUsed: false,
  });

export const getDialogPromptsByTags = async (
  model: Model<Prompts>,
  tags: Array<string>,
) =>
  await model
    .find<Prompts>({
      tags: {
        $all: tags,
      },
    })
    .sort({ position: 1 });

export const getRandomDialog = async (model: Model<Prompts>, event: string) => {
  const max = await model.count({
    event,
  });

  const skip = randomMixMax(0, max);

  return model
    .findOne<Prompts>({
      event,
    })
    .skip(skip);
};

export const getLastDialog = async (model: Model<Prompts>, event: string) =>
  await model.findOneAndUpdate<Prompts>(
    {
      event,
      isUsed: false,
      type: PROMPT_TYPE_ENUM.DIALOG,
    },
    {
      isUsed: true,
    },
    {
      sort: { position: 1 },
      new: true,
    },
  );

export const setLastDialog = async (model: Model<Prompts>, event: string) =>
  await model.findOneAndUpdate<Prompts>(
    {
      event,
      isUsed: false,
      type: PROMPT_TYPE_ENUM.DIALOG,
    },
    {
      isLast: true,
    },
    {
      sort: { position: -1 },
    },
  );
