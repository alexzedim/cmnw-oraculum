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
  PUBLIC_OPTION = 'is_public',
}

export enum CRYPTO_CIPHER_ENUM {
  AES_128_ECB = 'aes-128-ecb',
  RABBIT = 'rabbit',
  RC4 = 'rc4',
  DES = 'des',
}

export enum CRYPTO_DESCRIPTION_PARAMS {
  MESSAGE_ID = 'ID сообщения',
  CIPHER = 'Алгоритм шифрования',
  KEY = 'Ключ',
  PUBLIC = 'Публично?',
}

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
          name: CRYPTO_CIPHER_ENUM.AES_128_ECB,
          value: CRYPTO_CIPHER_ENUM.AES_128_ECB,
        },
        {
          name: CRYPTO_CIPHER_ENUM.RABBIT,
          value: CRYPTO_CIPHER_ENUM.RABBIT,
        },
        {
          name: CRYPTO_CIPHER_ENUM.RC4,
          value: CRYPTO_CIPHER_ENUM.RC4,
        },
        {
          name: CRYPTO_CIPHER_ENUM.DES,
          value: CRYPTO_CIPHER_ENUM.DES,
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
  .setDescription(ENCRYPT_ENUM.DESCRIPTION)
  .addStringOption((option) =>
    option
      .setName(ENCRYPT_ENUM.CIPHER_OPTION)
      .setDescription(CRYPTO_DESCRIPTION_PARAMS.CIPHER)
      .setRequired(true)
      .addChoices(
        {
          name: CRYPTO_CIPHER_ENUM.AES_128_ECB,
          value: CRYPTO_CIPHER_ENUM.AES_128_ECB,
        },
        {
          name: CRYPTO_CIPHER_ENUM.RABBIT,
          value: CRYPTO_CIPHER_ENUM.RABBIT,
        },
        {
          name: CRYPTO_CIPHER_ENUM.RC4,
          value: CRYPTO_CIPHER_ENUM.RC4,
        },
        {
          name: CRYPTO_CIPHER_ENUM.DES,
          value: CRYPTO_CIPHER_ENUM.DES,
        },
      ),
  )
  .addStringOption((option) =>
    option
      .setName(ENCRYPT_ENUM.KEY_OPTION)
      .setDescription(CRYPTO_DESCRIPTION_PARAMS.KEY)
      .setRequired(true),
  );
