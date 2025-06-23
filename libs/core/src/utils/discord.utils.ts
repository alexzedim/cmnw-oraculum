import { randomInt } from 'crypto';
import { DateTime } from 'luxon';
import { setTimeout } from 'node:timers/promises';

/**
 * @description Gives a random int number in-between requested values
 */
export const random = (min = 0, max = 100, divider?: number | undefined) =>
  divider ? randomInt(min, max) / divider : randomInt(min, max);

export const formatRedisKey = (key: string, formatter = 'PEPA') =>
  `${formatter}:${key}`;

export const isDurationNotPass = (sinceDate: Date, unitNumber = 6) => {
  const now = DateTime.now();
  const time = DateTime.fromJSDate(sinceDate);
  const diff = time.diff(now, 'hours').toObject();
  return diff.hours < unitNumber;
};

export const wait = async (seconds: number) => await setTimeout(seconds * 1000);

export const operationStatus = (isNew: boolean) =>
  isNew ? 'created' : 'updated';

export const now = () => DateTime.now().setZone('Europe/Moscow').toJSDate();
