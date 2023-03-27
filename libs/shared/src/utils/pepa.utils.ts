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
