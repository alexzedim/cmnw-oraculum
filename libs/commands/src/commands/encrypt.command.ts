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
      const { user } = interaction;

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
