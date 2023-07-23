import { SlashCommand } from '@cmnw/commands/types';
import { SlashCommandBuilder } from '@discordjs/builders';
import {
  BINDING_PARAMS_DESCRIPTION_ENUM,
  BINDING_PARAMS_ENUM,
  COMMAND_DESCRIPTION_ENUMS,
  COMMAND_ENUMS,
} from '@cmnw/commands/enums';

export const bindingCommand: SlashCommand = {
  name: COMMAND_ENUMS.BINDING,
  description: COMMAND_DESCRIPTION_ENUMS.FEFENYA_GOTD,
  slashCommand: new SlashCommandBuilder()
    .setName(COMMAND_ENUMS.BINDING)
    .setDescription(COMMAND_ENUMS.BINDING)
    .addRoleOption((option) =>
      option
        .setName(BINDING_PARAMS_ENUM.ROLE)
        .setDescription(BINDING_PARAMS_DESCRIPTION_ENUM.ROLE),
    )
    .addUserOption((option) =>
      option
        .setName(BINDING_PARAMS_ENUM.USER)
        .setDescription(BINDING_PARAMS_ENUM.USER)
        .setRequired(true),
    ),

  async executeInteraction({ interaction, models, logger }): Promise<void> {
    if (!interaction.isChatInputCommand()) return;
    try {
      const [role, user] = [
        interaction.options.getRole(BINDING_PARAMS_ENUM.ROLE, false),
        interaction.options.getUser(BINDING_PARAMS_ENUM.USER, false),
      ];

      if (role) {
        await models.rolesModel.findByIdAndUpdate(role.id, {
          name: role.name,
          guildId: interaction.guildId,
          updatedBy: interaction.client.user.id,
        });
      }
    } catch (errorOrException) {
      logger.error(errorOrException);
      await interaction.reply({
        content: errorOrException.message,
        ephemeral: true,
      });
    }
  },
};
