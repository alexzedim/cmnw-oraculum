import { SlashCommand } from '@cmnw/commands/types';
import { SlashCommandBuilder } from '@discordjs/builders';
import CryptoJS from 'crypto-js';
import {
  COMMAND_DESCRIPTION_ENUMS,
  COMMAND_ENUMS,
  CRYPTO_CIPHER_ENUMS,
  CRYPTO_DESCRIPTION_PARAMS,
  CRYPTO_PARAMS,
  CRYPTO_VECTOR_ENUMS,
} from '@cmnw/commands/const';

export const cryptoCommand: SlashCommand = {
  name: COMMAND_ENUMS.CRYPTO,
  description: COMMAND_DESCRIPTION_ENUMS.CRYPTO,
  slashCommand: new SlashCommandBuilder()
    .setName(COMMAND_ENUMS.CRYPTO)
    .setDescription(COMMAND_DESCRIPTION_ENUMS.CRYPTO)
    .addStringOption((option) =>
      option
        .setName(CRYPTO_PARAMS.MESSAGE_ID)
        .setDescription(CRYPTO_DESCRIPTION_PARAMS.MESSAGE_ID)
        .setRequired(true),
    )
    .addStringOption((option) =>
      option
        .setName(CRYPTO_PARAMS.VECTOR)
        .setDescription(CRYPTO_DESCRIPTION_PARAMS.VECTOR)
        .setRequired(true)
        .addChoices(
          {
            name: CRYPTO_VECTOR_ENUMS.DECRYPT,
            value: CRYPTO_VECTOR_ENUMS.DECRYPT,
          },
          {
            name: CRYPTO_VECTOR_ENUMS.ENCRYPT,
            value: CRYPTO_VECTOR_ENUMS.ENCRYPT,
          },
        ),
    )
    .addStringOption((option) =>
      option
        .setName(CRYPTO_PARAMS.CIPHER)
        .setDescription(CRYPTO_DESCRIPTION_PARAMS.CIPHER)
        .setRequired(true)
        .addChoices(
          {
            name: CRYPTO_CIPHER_ENUMS.AES_128_ECB,
            value: CRYPTO_CIPHER_ENUMS.AES_128_ECB,
          },
          {
            name: CRYPTO_CIPHER_ENUMS.RABBIT,
            value: CRYPTO_CIPHER_ENUMS.RABBIT,
          },
          {
            name: CRYPTO_CIPHER_ENUMS.RC4,
            value: CRYPTO_CIPHER_ENUMS.RC4,
          },
          {
            name: CRYPTO_CIPHER_ENUMS.DES,
            value: CRYPTO_CIPHER_ENUMS.DES,
          },
        ),
    )
    .addStringOption((option) =>
      option
        .setName(CRYPTO_PARAMS.KEY)
        .setDescription(CRYPTO_DESCRIPTION_PARAMS.KEY)
        .setRequired(true),
    ),

  async executeInteraction({ interaction, logger }) {
    if (!interaction.isChatInputCommand()) return;
    try {
      const [messageId, vector, cipher, key] = [
        interaction.options.getString(CRYPTO_PARAMS.MESSAGE_ID, true),
        interaction.options.getString(CRYPTO_PARAMS.VECTOR, true),
        interaction.options.getString(CRYPTO_PARAMS.CIPHER, true),
        interaction.options.getString(CRYPTO_PARAMS.KEY, true),
      ];

      // TODO build on modals

      const message = await interaction.channel.messages.fetch(messageId);
      if (!message) {
        throw new Error(
          `Не могу прочитать сообщение ${messageId}. Сообщение должно быть в канале где используется команда`,
        );
      }

      let text: string;

      const cypher = {
        [CRYPTO_CIPHER_ENUMS.AES_128_ECB]: CryptoJS.AES,
        [CRYPTO_CIPHER_ENUMS.RABBIT]: CryptoJS.Rabbit,
        [CRYPTO_CIPHER_ENUMS.RC4]: CryptoJS.RC4,
        [CRYPTO_CIPHER_ENUMS.DES]: CryptoJS.DES,
      };

      if (vector === CRYPTO_VECTOR_ENUMS.ENCRYPT) {
        // Encrypt
        text = cypher[cipher]
          .encrypt(
            message.content,
            key,
            cipher === CRYPTO_CIPHER_ENUMS.AES_128_ECB
              ? {
                  mode: CryptoJS.mode.ECB,
                  padding: CryptoJS.pad.NoPadding,
                }
              : {
                  padding: CryptoJS.pad.NoPadding,
                },
          )
          .toString();
      }

      if (vector === CRYPTO_VECTOR_ENUMS.DECRYPT) {
        text = cypher[cipher]
          .decrypt(
            message.content,
            key,
            cipher === CRYPTO_CIPHER_ENUMS.AES_128_ECB
              ? {
                  mode: CryptoJS.mode.ECB,
                  padding: CryptoJS.pad.NoPadding,
                }
              : {
                  padding: CryptoJS.pad.NoPadding,
                },
          )
          .toString(CryptoJS.enc.Utf8);
      }

      await interaction.reply({ content: text });
    } catch (errorOrException) {
      logger.error(errorOrException);
      await interaction.reply({
        content: errorOrException.message,
        ephemeral: true,
      });
    }
  },
};
