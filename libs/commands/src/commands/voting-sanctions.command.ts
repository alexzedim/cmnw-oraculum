import { SlashCommand } from '@cmnw/commands/types';
import { DateTime, Duration } from 'luxon';
import { EmbedBuilder } from 'discord.js';

import {
  VOTING_SANCTIONS,
  VOTING_SANCTIONS_ACTION,
  VOTING_SANCTIONS_ENUM,
} from '@cmnw/commands/const';

import { votingButtons } from '@cmnw/commands/components';
import { isVotingActive } from '@cmnw/core';

export const votingSanctionsCommand: SlashCommand = {
  name: VOTING_SANCTIONS_ENUM.NAME,
  description: VOTING_SANCTIONS_ENUM.DESCRIPTION,
  slashCommand: VOTING_SANCTIONS,

  async executeInteraction({
    interaction,
    redis,
    models,
    logger,
  }): Promise<void> {
    if (!interaction.isChatInputCommand()) return;
    try {
      const { options, user } = interaction;
      logger.log(`${VOTING_SANCTIONS_ENUM.NAME} triggered by ${user.id}`);

      const [action, userSanctioned, allowedRole] = [
        options.getString(VOTING_SANCTIONS_ENUM.ACTION_OPTION, true),
        options.getUser(VOTING_SANCTIONS_ENUM.USER_OPTION, true),
        options.getRole(VOTING_SANCTIONS_ENUM.ROLE_OPTION, false),
        // TODO time
        // TODO is anonymous
      ];

      const interactionResponse = await interaction.deferReply();

      const buttons = votingButtons();

      const { votingModel } = models;
      // TODo initiatedBy
      const initiatedById = interaction.user.id;

      const votingAction = VOTING_SANCTIONS_ACTION.get(action);

      let membersCount;

      // TODO last members from channel
      // TODO only in channel
      // TODO only in role

      if (allowedRole) {
        const r = allowedRole.position;
        const guild = interaction.guild;
        membersCount = guild.memberCount;

        await guild.members.fetch();

        const t = guild.roles.cache
          .get(allowedRole.id)
          .members.map((m) => m.user.tag);
      }

      const until = DateTime.now().plus({ minutes: 3 });
      const remains = Duration.fromObject(
        { seconds: 180 },
        { locale: 'ru' },
      ).toHuman();

      const activeVoting = await isVotingActive(
        models.votingModel,
        interactionResponse.id,
        // TODO date
      );

      const t = new votingModel({
        id: interactionResponse.id,
        initiatedBy: initiatedById,
        type: VOTING_SANCTIONS_ENUM.NAME,
      });

      const memberVoters = 5;
      const quorum = Math.ceil(memberVoters * 0.7);
      const status = 'РЕШЕНИЕ НЕ ПРИНЯТО';

      const embed = new EmbedBuilder()
        .setTitle(
          `Количественное голосование за **${votingAction}** к ${userSanctioned.username}`,
        )
        .setDescription(
          `
        Инициировано: ${interaction.user.username}
        Доступно для ${memberVoters} участников
        Необходимо для кворума: 70% | ${quorum}
        
        ⠀⠀⠀⠀⠀⠀⠀⠀⠀*голосование активно ещё ${remains}*
        
        ⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀**${status}**
        `,
        )
        .setColor('#00FF98')
        .addFields([
          {
            name: '───────────────',
            value: `⠀⠀⠀⠀⠀За: 0\n───────────────`,
            inline: true,
          },
          {
            name: `───────────────`,
            value: `Решение будет принято *только* при\n${quorum} из ${memberVoters} голосах\n───────────────`,
            inline: true,
          },
          {
            name: `───────────────`,
            value: `⠀⠀⠀Против: 0\n───────────────`,
            inline: true,
          },
        ])
        .setThumbnail(interaction.guild.iconURL());

      // TODO interactionResponse.id
      await votingModel.findOneAndUpdate();

      await interaction.editReply({
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
