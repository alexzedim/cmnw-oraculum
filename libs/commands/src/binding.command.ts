import { SlashCommand } from '@cmnw/commands/types';
import { COMMAND_DESCRIPTION_ENUMS, COMMAND_ENUMS } from '@cmnw/commands/enums';
import { SlashCommandBuilder } from '@discordjs/builders';

export const bindingCommand: SlashCommand = {
  name: COMMAND_ENUMS.BINDING,
  description: COMMAND_DESCRIPTION_ENUMS.FEFENYA_GOTD,
  slashCommand: new SlashCommandBuilder()
    .setName(COMMAND_ENUMS.BINDING)
    .setDescription(COMMAND_ENUMS.BINDING),

  async executeInteraction({ interaction, models, logger }): Promise<void> {
    if (!interaction.isChatInputCommand()) return;
  },
};
