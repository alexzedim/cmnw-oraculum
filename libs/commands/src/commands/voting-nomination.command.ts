import { SlashCommand } from '@cmnw/commands/types';
import { TextChannel } from 'discord.js';
import { DateTime, Duration } from 'luxon';
import {
  buildVotingAction,
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
      const { options, user } = interaction;

      logger.log(`${VOTING_NOMINATION_ENUM.NAME} triggered by ${user.id}`);

      const [userCandidate, role] = [
        options.getUser(VOTING_NOMINATION_ENUM.NAME_OPTION, true),
        options.getRole(VOTING_NOMINATION_ENUM.ROLE_OPTION, true),
      ];

      const isTextBased = interaction.channel.isTextBased();
      if (!isTextBased) return;

      const t = (interaction.channel as TextChannel).members;
      console.log((interaction.channel as TextChannel).members.size);
      // t.mapValues((m) => console.log(m.user.username));
      // TODO base on channelIdCategory = bind voting pull

      const initiatedBy = user.id;
      const isSelfTriggered = initiatedBy === userCandidate.id;

      const guildMember = interaction.guild.members.cache.get(userCandidate.id);
      const guildMemberInitiate = interaction.guild.members.cache.get(
        user.id,
      );
      const hasRole = guildMember.roles.cache.has(role.id);
      const hasPermission = guildMemberInitiate.roles.cache.has(role.id);
      const isRankHigher =
        guildMemberInitiate.roles.highest.position > role.position;
      const isEqual = guildMemberInitiate.roles.cache.has(role.id);
      // TODO your role is ok for nomination
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

      const { title, description } = buildVotingAction(
        userCandidate.id,
        role.id,
        isDemoted,
      );

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
