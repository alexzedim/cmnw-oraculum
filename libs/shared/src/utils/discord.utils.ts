import { randomInt } from 'crypto';

/**
 * @description Gives a random int number in-between requested values
 * @param min {number} Minimal number
 * @param max {number} Maximum number
 */
export const cryptoRandomIntBetween = (min: number, max: number) =>
  randomInt(min, max + 1);

/**
 * @description Gives a random float number in-between requested values with precision of decimal arg
 * @param min {number} Minimal float
 * @param max {number} Maximum float
 * @param decimals {number} Precision value
 */
export const randInBetweenFloat = (
  min: number,
  max: number,
  decimals: number,
) => Number((Math.random() * (max - min) + min).toFixed(decimals));

export const formatRedisKey = (key: string, formatter = 'FEFENYA') =>
  `${formatter}:${key}`;
