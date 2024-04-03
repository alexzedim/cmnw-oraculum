import { ALGO, ENCRYPT_ENUM, isAlgo } from '@cmnw/commands/const';
import { SlashModel } from '@cmnw/commands/types';
import { encryptAES256, toBase64, toHex } from '@cmnw/core';

export const encryptionModal: SlashModel = {
  name: ENCRYPT_ENUM.NAME,
  description: ENCRYPT_ENUM.DESCRIPTION,
  async executeInteraction({ interaction, logger }) {
    if (!interaction.isModalSubmit()) return;
    try {
      const { fields } = interaction;

      const algoInput = fields.getTextInputValue('algoInput');
      const textInput = fields.getTextInputValue('textInput');
      const keyInput = fields.getTextInputValue('keyInput');

      const isInAlgo = isAlgo(algoInput);
      if (!isInAlgo) throw new Error(`Choose valid cipher: ${ALGO}`);

      let content = textInput;

      if (algoInput === 'hex') content = toHex(textInput);
      if (algoInput === 'base64') content = toBase64(textInput);
      if (algoInput === 'aes-256') content = encryptAES256(textInput, keyInput);
      // TODO split 2000+ symbols
      await interaction.reply({ content, ephemeral: false });
    } catch (errorOrException) {
      logger.error(errorOrException);
      await interaction.reply({
        content: errorOrException.message,
        ephemeral: true,
      });
    }
  },
};
