import { SlashCommand } from '@cmnw/commands/types';
import { MessageActionRowComponentBuilder } from '@discordjs/builders';
import { ActionRowBuilder, ButtonBuilder, EmbedBuilder } from 'discord.js';
import { ButtonStyle } from 'discord-api-types/v10';
import { DateTime, Duration } from 'luxon';
import {
  COMMAND_ENUMS,
  VOTING_NOMINATION,
  VOTING_NOMINATION_ENUM,
  votingButtons,
  votingEmbed,
} from '@cmnw/commands';

export const votingNominationCommand: SlashCommand = {
  name: VOTING_NOMINATION_ENUM.NAME,
  description: VOTING_NOMINATION_ENUM.DESCRIPTION,
  slashCommand: VOTING_NOMINATION,

  executeInteraction: async function ({
    interaction,
    redis,
    models,
    logger,
  }): Promise<void> {
    if (!interaction.isChatInputCommand()) return;
    try {
      logger.log(`${VOTING_NOMINATION_ENUM.NAME} has been triggered`);

      const [user, role, initiateUser] = [
        interaction.options.getUser(VOTING_NOMINATION_ENUM.NAME_OPTION, true),
        interaction.options.getRole(VOTING_NOMINATION_ENUM.ROLE_OPTION, true),
        interaction.user,
      ];

      console.log(interaction.channel);

      const initiatedBy = initiateUser.id;
      const isSelfTriggered = initiatedBy === user.id;

      const guildMember = interaction.guild.members.cache.get(user.id);
      const hasRole = guildMember.roles.cache.has(role.id);
      // TODO check initiateBy not in cd
      // TODO no self nominated
      const isRetired = isSelfTriggered && hasRole;
      const isSelfNominated = isSelfTriggered && !hasRole;
      const isDemoted = !isSelfTriggered && hasRole;

      // TODO vote for quorum or cancel
      // TODO timer?
      const until = DateTime.now().plus({ hours: 24 });
      const remains = Duration.fromObject(
        { hours: 24 },
        { locale: 'ru' },
      ).toHuman();

      // TODO if role is exists, then demote
      const titleAction = isDemoted
        ? 'освобождение от указанной'
        : 'назначение';
      const title = `Голосование за ${titleAction} роли`;
      const description = `Назначить <@${user.id}> на роль <@&${role.id}>`;

      // TODO get members
      const memberVoters = 5;
      const quorumCutoff = Math.ceil(memberVoters * 0.7);
      const status = 'РЕШЕНИЕ НЕ ПРИНЯТО';

      const buttons = votingButtons();
      const embed = votingEmbed(
        title,
        description,
        initiatedBy,
        memberVoters,
        status,
        interaction.guild.iconURL(),
      );

      await interaction.reply({
        embeds: [embed],
        components: [buttons],
      });
    } catch (errorOrException) {
      logger.error(errorOrException);
      await interaction.reply({
        content: errorOrException.message,
        ephemeral: true,
      });
    }
  },
};
