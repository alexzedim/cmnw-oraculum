import CryptoJS from 'crypto-js';
import {
  CRYPTO_CIPHER_ENUM,
  DECRYPT,
  DECRYPT_ENUM,
  ISlashCommand,
} from '@cmnw/commands';

export const decryptCommand: ISlashCommand = {
  name: DECRYPT_ENUM.NAME,
  description: DECRYPT_ENUM.DESCRIPTION,
  slashCommand: DECRYPT,

  async executeInteraction({ interaction, logger }) {
    if (!interaction.isChatInputCommand()) return;
    try {
      const { options, channel } = interaction;

      const [messageId, cipher, key, ephemeral] = [
        options.getString(DECRYPT_ENUM.MESSAGE_OPTION, true),
        options.getString(DECRYPT_ENUM.CIPHER_OPTION, true),
        options.getString(DECRYPT_ENUM.KEY_OPTION, true),
        options.getBoolean(DECRYPT_ENUM.PUBLIC_OPTION, false),
      ];

      const message = await channel.messages.fetch(messageId);
      if (!message) {
        throw new Error(
          `Не могу прочитать сообщение ${messageId}. Сообщение должно быть в канале где используется команда`,
        );
      }

      const cypher = {
        [CRYPTO_CIPHER_ENUM.AES_128_ECB]: CryptoJS.AES,
        [CRYPTO_CIPHER_ENUM.RABBIT]: CryptoJS.Rabbit,
        [CRYPTO_CIPHER_ENUM.RC4]: CryptoJS.RC4,
        [CRYPTO_CIPHER_ENUM.DES]: CryptoJS.DES,
      };

      const text = cypher[cipher]
        .decrypt(
          message.content,
          key,
          cipher === CRYPTO_CIPHER_ENUM.AES_128_ECB
            ? {
                mode: CryptoJS.mode.ECB,
                padding: CryptoJS.pad.NoPadding,
              }
            : {
                padding: CryptoJS.pad.NoPadding,
              },
        )
        .toString(CryptoJS.enc.Utf8);

      await interaction.reply({ content: text, ephemeral: ephemeral });
    } catch (errorOrException) {
      logger.error(errorOrException);
      await interaction.reply({
        content: errorOrException.message,
        ephemeral: true,
      });
    }
  },
};
