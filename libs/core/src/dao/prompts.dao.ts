import { Model } from 'mongoose';
import { Prompts } from '@cmnw/mongo';
import { CHAT_ROLE_ENUM } from '@cmnw/core/enums';
import { random } from '@cmnw/core/utils';

export const getSystemPrompt = async (model: Model<Prompts>, name: string) =>
  await model.findOne<Prompts>({
    name,
    role: CHAT_ROLE_ENUM.SYSTEM,
  });

export const getPrompt = async (model: Model<Prompts>, searchBy: string) => {
  // TODO probably aggregate pipeline
  return model
    .findOne<Prompts>(
      { $text: { $search: searchBy } },
      { score: { $meta: 'textScore' } },
    )
    .sort({ score: { $meta: 'textScore' } });
};

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
        onEvent: event,
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
    onEvent: event,
    isGenerated: true,
    role: CHAT_ROLE_ENUM.ASSISTANT,
  });

  const skip = random(0, max);

  return model
    .findOne<Prompts>({
      onEvent: event,
      isGenerated: true,
      role: CHAT_ROLE_ENUM.ASSISTANT,
    })
    .skip(skip);
};
