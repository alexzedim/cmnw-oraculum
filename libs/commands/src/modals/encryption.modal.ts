import { CRYPTO_CIPHER_ENUM, ENCRYPT_ENUM } from '@cmnw/commands/const';
import { SlashModel } from '@cmnw/commands/types';
import CryptoJS from 'crypto-js';

export const encryptionModel: SlashModel = {
  name: ENCRYPT_ENUM.NAME,
  description: ENCRYPT_ENUM.DESCRIPTION,
  async executeInteraction({ interaction, logger }) {
    if (!interaction.isModalSubmit()) return;
    try {
      const { fields } = interaction;

      const cipher = CRYPTO_CIPHER_ENUM.AES_128_ECB;
      const textInput = fields.getTextInputValue('textInput');
      const keyInput = fields.getTextInputValue('keyInput');
      console.log({ textInput, keyInput });

      const cypher = {
        [CRYPTO_CIPHER_ENUM.AES_128_ECB]: CryptoJS.AES,
        [CRYPTO_CIPHER_ENUM.RABBIT]: CryptoJS.Rabbit,
        [CRYPTO_CIPHER_ENUM.RC4]: CryptoJS.RC4,
        [CRYPTO_CIPHER_ENUM.DES]: CryptoJS.DES,
      };

      const text = cypher[cipher]
        .encrypt(
          textInput,
          keyInput,
          cipher === CRYPTO_CIPHER_ENUM.AES_128_ECB
            ? {
                mode: CryptoJS.mode.ECB,
                padding: CryptoJS.pad.NoPadding,
              }
            : {
                padding: CryptoJS.pad.NoPadding,
              },
        )
        .toString();

      await interaction.reply({ content: text, ephemeral: false });
    } catch (errorOrException) {
      logger.error(errorOrException);
      await interaction.reply({
        content: errorOrException.message,
        ephemeral: true,
      });
    }
  },
};
