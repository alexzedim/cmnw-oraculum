import { random } from '@cmnw/core/utils/discord.utils';

export const prettyContestReply = (replyBack: string) => {
  const [r, s] = [new RegExp('"', 'g'), new RegExp('\\s\\d.', 'g')];

  return replyBack
    .replace(r, '')
    .replace(s, (str) => `\n${str}`)
    .split('\n')
    .map((s) => s.trim());
};

export const prettyContestPrompt = (
  text: string,
  name?: string,
  trophy?: string,
  winner?: string,
) =>
  text
    .replace(new RegExp(`{name}`, 'g'), name)
    .replace(new RegExp(`{trophy}`, 'g'), trophy)
    .replace(new RegExp(`{winner}`, 'g'), winner);

export const randomStyleReply = (replyBack: string) => {
  const i = random(0, 3);
  const trimmed = replyBack.trim();
  if (i > 2) return `***${trimmed}***`;
  if (i > 1) return `**${trimmed}**`;
  if (i > 0) return `*${trimmed}*`;
  return trimmed;
};
