import { CONTEST_BIND, CONTEST_BIND_ENUM, SlashCommand } from '@cmnw/commands';
import { ChannelType } from 'discord-api-types/payloads/v10/channel';
import { Prompts } from '@cmnw/mongo';
import {
  bindRoleContest,
  buildContest,
  CHAT_ROLE_ENUM,
  EVENT_PROMPT_ENUM,
  random,
} from '@cmnw/core';

export const contestBindCommand: SlashCommand = {
  name: CONTEST_BIND_ENUM.NAME,
  description: CONTEST_BIND_ENUM.DESCRIPTION,
  slashCommand: CONTEST_BIND,

  async executeInteraction({ interaction, models, logger }): Promise<unknown> {
    if (!interaction.isChatInputCommand()) return;
    try {
      const { contestModel, rolesModel, promptsModel } = models;
      const { options, user, guildId } = interaction;

      logger.log(`${CONTEST_BIND_ENUM.NAME} triggered by ${user.id}`);
      // TODO else show embed with contest?
      const [role, channel, title] = [
        options.getRole(CONTEST_BIND_ENUM.ROLE_OPTION, true),
        options.getChannel(CONTEST_BIND_ENUM.CHANNEL_OPTION, true),
        options.getString(CONTEST_BIND_ENUM.TITLE_OPTION, false),
      ];

      const isGuildText = channel.type === ChannelType.GuildText;
      if (!isGuildText) {
        throw new Error('pisya');
      }

      // TODO find and update
      const roleEntity = await bindRoleContest(rolesModel, {
        _id: role.id,
        name: role.name,
        guildId: interaction.guildId,
        description: title,
        isMentionable: role.mentionable,
        position: role.position,
        updatedBy: interaction.client.user.id,
      });

      // TODO random starting prompt on bind
      const promptsStaring = await promptsModel.find<Prompts>({
        // TODO from current profile generated
        position: 1,
        isGenerated: true,
        // TODO reset status
        onEvent: EVENT_PROMPT_ENUM.TROPHY,
        type: EVENT_PROMPT_ENUM.CONTEST,
        role: CHAT_ROLE_ENUM.ASSISTANT,
      });

      const startingContestPrompt =
        promptsStaring[random(0, promptsStaring.length - 1)];

      const contestEntity = await buildContest(
        contestModel,
        guildId,
        channel.id,
        title,
        user.id,
        role.id,
      );

      // TODO baxnem chto-nit smeshnoe + embed
      const text = 'Погнали бахнем что-нить смешное';
      await interaction.reply({ content: text, ephemeral: true });
    } catch (errorOrException) {
      logger.error(errorOrException);
      await interaction.reply({
        content: errorOrException.message,
        ephemeral: true,
      });
    }
  },
};
