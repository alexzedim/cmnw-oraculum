import { ICacheArgs, ICacheResult } from '@cmnw/commands/types';

export const generateKey = (args: ICacheArgs): ICacheResult => {
  const { command, guildId, userId } = args;

  const userKey = `${command}:${guildId}:${userId}`;
  const commandKey = `${command}:${guildId}:active`;
  const guildKey = `${command}:${guildId}`;

  return { commandKey, guildKey, userKey };
};
