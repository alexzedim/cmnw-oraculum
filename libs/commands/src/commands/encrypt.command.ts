import {
  ENCRYPT,
  ENCRYPT_ENUM,
  encCryptoModal,
  SlashCommand,
} from '@cmnw/commands';

export const encryptCommand: SlashCommand = {
  name: ENCRYPT_ENUM.NAME,
  description: ENCRYPT_ENUM.DESCRIPTION,
  slashCommand: ENCRYPT,
  async executeInteraction({ interaction, logger }) {
    if (!interaction.isChatInputCommand()) return;
    try {
      const { options } = interaction;

      const [key, cipher, user] = [
        interaction.options.getString(ENCRYPT_ENUM.KEY_OPTION, true),
        interaction.options.getString(ENCRYPT_ENUM.CIPHER_OPTION, true),
        interaction.user,
      ];

      logger.log(`${ENCRYPT_ENUM.NAME} triggered by ${user.id}`);

      await interaction.showModal(encCryptoModal);
    } catch (errorOrException) {
      logger.error(errorOrException);
      await interaction.reply({
        content: errorOrException.message,
        ephemeral: true,
      });
    }
  },
};
