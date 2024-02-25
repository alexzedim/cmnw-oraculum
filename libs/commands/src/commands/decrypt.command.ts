import { DECRYPT, DECRYPT_ENUM, ISlashInteraction } from '@cmnw/commands';
import { decryptAES256, fromBase64, fromHex } from '@cmnw/core';

export const decryptCommand: ISlashInteraction = {
  name: DECRYPT_ENUM.NAME,
  description: DECRYPT_ENUM.DESCRIPTION,
  slashCommand: DECRYPT,

  async executeInteraction({ interaction, logger }) {
    if (!interaction.isChatInputCommand()) return;
    try {
      const { options, channel, user } = interaction;
      logger.log(`${DECRYPT_ENUM.NAME} triggered by ${user.id}`);

      const [messageId, cipher, cipherKey, ephemeral] = [
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

      let content = message.content;

      if (cipher === 'hex') content = fromBase64(content);
      if (cipher === 'base64') content = fromHex(content);
      if (cipher === 'aes-256') content = decryptAES256(content, cipherKey);

      await interaction.reply({ content: content, ephemeral: !ephemeral });
    } catch (errorOrException) {
      logger.error(errorOrException);
      await interaction.reply({
        content: errorOrException.message,
        ephemeral: true,
      });
    }
  },
};
