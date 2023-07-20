import { cryptoRandomIntBetween } from '@cmnw/core/utils/discord.utils';

/**
 * @description Generate random greeting for GotD command
 * @param userId {string} id of discord guild member
 * */
export const gotdGreeter = (userId: string) => `<@${userId}>`;

export const gotdSelected = (greeting: string, username: string) =>
  `${greeting} ${username}`;

export const prettyGotd = (replyBack: string, name: string) => {
  const [r, s, n] = [
    new RegExp('"', 'g'),
    new RegExp('\\s\\d.', 'g'),
    new RegExp('{name}', 'g'),
  ];

  return replyBack
    .replace(r, '')
    .replace(s, (str) => `\n${str}`)
    .replace(n, name)
    .split('\n');
};

export const prettyReply = (replyBack: string) => {
  const i = cryptoRandomIntBetween(0, 3);
  const trimmed = replyBack.trim();
  if (i > 2) return `***${trimmed}***`;
  if (i > 1) return `**${trimmed}**`;
  if (i > 0) return `*${trimmed}*`;
  return trimmed;
};
