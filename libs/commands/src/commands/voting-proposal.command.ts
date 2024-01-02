import { SlashCommand } from '@cmnw/commands/types';
import { VOTING_PROPOSAL, VOTING_PROPOSAL_ENUM } from '@cmnw/commands';

export const votingProposalCommand: SlashCommand = {
  name: VOTING_PROPOSAL_ENUM.NAME,
  description: VOTING_PROPOSAL_ENUM.DESCRIPTION,
  slashCommand: VOTING_PROPOSAL,

  executeInteraction: async function ({
    interaction,
    redis,
    models,
    logger,
  }): Promise<void> {
    if (!interaction.isChatInputCommand()) return;
    try {
      logger.log(
        `${VOTING_PROPOSAL_ENUM.NAME} triggered by ${interaction.user.id}`,
      );
      // TODO logic
    } catch (errorOrException) {
      logger.error(errorOrException);
      await interaction.reply({
        content: errorOrException.message,
        ephemeral: true,
      });
    }
  },
};
