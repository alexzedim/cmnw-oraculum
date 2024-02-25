import { CIPHER_AES_256, CIPHER_AES_128 } from '@cmnw/core/const';
import process from 'node:process';
import { Buffer } from 'node:buffer';
import {
  createCipheriv,
  createDecipheriv,
  randomInt,
  scryptSync,
} from 'node:crypto';

export const toBase64 = (s: string) =>
  Buffer.from(s, 'utf8').toString('base64');

export const fromBase64 = (s: string) =>
  Buffer.from(s, 'base64').toString('utf8');

export const fromHex = (s: string) => Buffer.from(s, 'hex').toString('utf8');

export const toHex = (s: string) => Buffer.from(s, 'utf8').toString('hex');

export const encryptAES256 = (s: string, key: string) => {
  const iv = Buffer.alloc(16, 0);
  const key32 = scryptSync(key, key, 32);
  const algo = createCipheriv(CIPHER_AES_256, key32, iv);
  return algo.update(s, 'utf8', 'hex') + algo.final('hex');
};

export const decryptAES256 = (s: string, key: string) => {
  const iv = Buffer.alloc(16, 0);
  const key32 = scryptSync(key, key, 32);
  const algo = createDecipheriv(CIPHER_AES_256, key32, iv);
  return algo.update(s, 'hex', 'utf8') + algo.final('utf8');
};

export const encrypt = (sensitive: string) => {
  const key = Buffer.from(process.env.KEY);
  const cipher = createCipheriv(CIPHER_AES_128, key, null);
  const encrypted = Buffer.from(
    cipher.update(sensitive, 'utf8', 'hex') + cipher.final('hex'),
  ).toString('base64');
  return `enc:${encrypted}`;
};

export const decrypt = (sensitiveEnc: string) => {
  if (!sensitiveEnc || process.env.NODE_ENV !== 'production')
    return sensitiveEnc;
  const key = Buffer.from(process.env.KEY);
  const [s, encryptedData] = sensitiveEnc.split(':');
  if (s !== 'enc') return sensitiveEnc;
  const buff = Buffer.from(encryptedData, 'base64');
  const decipher = createDecipheriv(CIPHER_AES_128, key, null);
  return (
    decipher.update(buff.toString(), 'hex', 'utf8') + decipher.final('utf8')
  );
};

/**
 * @description Gives a random int number in-between requested values
 * @param min {number} Minimal number
 * @param max {number} Maximum number
 */
export const cryptoRandomIntBetween = (min: number, max: number) =>
  randomInt(min, max + 1);
