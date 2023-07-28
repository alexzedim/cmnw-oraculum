import { Model } from 'mongoose';
import { Prompts } from '@cmnw/mongo';
import { CHAT_ROLE_ENUM, PROMPT_TYPE_ENUM } from '@cmnw/core/enums';
import { randomMixMax } from '@cmnw/core/utils';

export const getSystemPrompt = async (model: Model<Prompts>, name: string) =>
  await model.findOne<Prompts>({
    name,
    role: CHAT_ROLE_ENUM.SYSTEM,
  });

export const buildDialogFlow = async (
  model: Model<Prompts>,
  name: string,
  event: string,
) => {
  const [profilePrompt, prompts] = await Promise.all([
    model.findOne<Prompts>({
      name,
      role: CHAT_ROLE_ENUM.SYSTEM,
    }),
    model
      .find<Prompts>({
        event,
        isUsed: false,
      })
      .sort({ position: 1 }),
  ]);

  if (!profilePrompt) throw new Error(`Prompt from name ${name} not found!`);

  return [profilePrompt, ...prompts];
};

export const getDialogPromptsByAllTags = async (
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

export const getRandomReplyByEvent = async (
  model: Model<Prompts>,
  event: string,
) => {
  const max = await model.count({
    event,
    isGenerated: true,
    role: CHAT_ROLE_ENUM.ASSISTANT,
  });

  const skip = randomMixMax(0, max);

  return model
    .findOne<Prompts>({
      event,
      isGenerated: true,
      role: CHAT_ROLE_ENUM.ASSISTANT,
    })
    .skip(skip);
};

export const getLastDialogFlow = async (model: Model<Prompts>, event: string) =>
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
