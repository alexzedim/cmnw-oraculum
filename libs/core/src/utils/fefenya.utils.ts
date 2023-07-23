import { randomMixMax } from '@cmnw/core/utils/discord.utils';
import { Fefenya } from '@cmnw/mongo';
import { Model } from 'mongoose';

/**
 * @description Generate random greeting for GotD command
 * @param userId {string} id of discord guild member
 * */
export const gotdGreeter = (userId: string) => `<@${userId}>`;

export const gotdSelected = (greeting: string, username: string) =>
  `${greeting} ${username}`;

export const prettyGotd = async (
  model: Model<Fefenya>,
  guildId: string,
  replyBack: string,
  name: string,
) => {
  const max = await model.count({ guildId });
  const skip = randomMixMax(0, max);
  const random = await model.findOne<Fefenya>({ guildId }).skip(skip);

  const [r, s, n, u] = [
    new RegExp('"', 'g'),
    new RegExp('\\s\\d.', 'g'),
    new RegExp('{name}', 'g'),
    new RegExp('(@username)\\w+', 'g'),
  ];

  return replyBack
    .replace(r, '')
    .replace(s, (str) => `\n${str}`)
    .replace(n, name)
    .replace(u, `<@${random._id}>`)
    .split('\n');
};

export const formatNaming = (text: string, name: string) =>
  text.replace(`{name}`, name);

export const prettyReply = (replyBack: string) => {
  const i = randomMixMax(0, 3);
  const trimmed = replyBack.trim();
  if (i > 2) return `***${trimmed}***`;
  if (i > 1) return `**${trimmed}**`;
  if (i > 0) return `*${trimmed}*`;
  return trimmed;
};
