import { SlashCommandBuilder } from '@discordjs/builders';

export enum ENCRYPT_ENUM {
  NAME = 'encrypt',
  DESCRIPTION = 'Зашифровать выбранный текст',
  CIPHER_OPTION = 'cipher',
  KEY_OPTION = 'key',
}

export enum DECRYPT_ENUM {
  NAME = 'decrypt',
  DESCRIPTION = 'Расшифровать выбранное сообщение',
  MESSAGE_OPTION = 'message',
  CIPHER_OPTION = 'cipher',
  KEY_OPTION = 'key',
  PUBLIC_OPTION = 'public',
}

export enum CRYPTO_CIPHER_ENUM {
  AES_256_CBC = 'aes-256',
  HEX = 'hex',
  BASE64 = 'base64',
}

export enum CRYPTO_DESCRIPTION_PARAMS {
  MESSAGE_ID = 'ID сообщения',
  CIPHER = 'Алгоритм шифрования',
  KEY = 'Ключ',
  PUBLIC = 'Публично?',
}

export const ALGO = ['hex', 'base64', 'aes-256'].join(' | ');

export const isAlgo = (str: string) => ALGO.includes(str.toLowerCase());

export const DECRYPT = new SlashCommandBuilder()
  .setName(DECRYPT_ENUM.NAME)
  .setDescription(DECRYPT_ENUM.DESCRIPTION)
  .addStringOption((option) =>
    option
      .setName(DECRYPT_ENUM.MESSAGE_OPTION)
      .setDescription(CRYPTO_DESCRIPTION_PARAMS.MESSAGE_ID)
      .setRequired(true),
  )
  .addStringOption((option) =>
    option
      .setName(ENCRYPT_ENUM.CIPHER_OPTION)
      .setDescription(CRYPTO_DESCRIPTION_PARAMS.CIPHER)
      .setRequired(true)
      .addChoices(
        {
          name: CRYPTO_CIPHER_ENUM.AES_256_CBC,
          value: CRYPTO_CIPHER_ENUM.AES_256_CBC,
        },
        {
          name: CRYPTO_CIPHER_ENUM.HEX,
          value: CRYPTO_CIPHER_ENUM.HEX,
        },
        {
          name: CRYPTO_CIPHER_ENUM.BASE64,
          value: CRYPTO_CIPHER_ENUM.BASE64,
        },
      ),
  )
  .addStringOption((option) =>
    option
      .setName(DECRYPT_ENUM.KEY_OPTION)
      .setDescription(CRYPTO_DESCRIPTION_PARAMS.KEY)
      .setRequired(true),
  )
  .addBooleanOption((option) =>
    option
      .setName(DECRYPT_ENUM.PUBLIC_OPTION)
      .setDescription(CRYPTO_DESCRIPTION_PARAMS.PUBLIC),
  );

export const ENCRYPT = new SlashCommandBuilder()
  .setName(ENCRYPT_ENUM.NAME)
  .setDescription(ENCRYPT_ENUM.DESCRIPTION);
