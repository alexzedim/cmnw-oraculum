import { SlashCommand } from '@cmnw/commands/types';
import {
  ActionRowBuilder,
  ButtonBuilder,
  Collection,
  EmbedBuilder,
} from 'discord.js';
import { ButtonStyle } from 'discord-api-types/v10';
import {
  COMMAND_DESCRIPTION_ENUMS,
  COMMAND_ENUMS,
  VOTING_ACTION_PARAMS,
  VOTING_SANCTIONS_DESCRIPTION,
  VOTING_SANCTIONS_PARAMS,
} from '@cmnw/commands/enums';

import {
  MessageActionRowComponentBuilder,
  SlashCommandBuilder,
} from '@discordjs/builders';
import { DateTime, Duration } from 'luxon';

export const votingSanctionsCommand: SlashCommand = {
  name: COMMAND_ENUMS.VOTING_SANCTIONS,
  description: COMMAND_DESCRIPTION_ENUMS.VOTING_SANCTIONS,
  slashCommand: new SlashCommandBuilder()
    .setName(COMMAND_ENUMS.VOTING_SANCTIONS)
    .setDescription(COMMAND_ENUMS.VOTING_SANCTIONS)
    .addStringOption((option) =>
      option
        .setName(VOTING_SANCTIONS_PARAMS.ACTION)
        .setDescription(VOTING_SANCTIONS_DESCRIPTION.ACTION_DESCRIPTION)
        .setRequired(true)
        .addChoices(
          { name: VOTING_ACTION_PARAMS.MUTE, value: 'mute' },
          { name: VOTING_ACTION_PARAMS.BAN, value: 'ban' },
          { name: VOTING_ACTION_PARAMS.KICK, value: 'kick' },
        ),
    )
    .addUserOption((option) =>
      option
        .setName(VOTING_SANCTIONS_PARAMS.USER)
        .setDescription(VOTING_SANCTIONS_DESCRIPTION.USER_DESCRIPTION)
        .setRequired(true),
    ),

  async executeInteraction({ interaction, models, logger }): Promise<void> {
    if (!interaction.isChatInputCommand()) return;
    try {
      const [action, user] = [
        interaction.options.getString(VOTING_SANCTIONS_PARAMS.ACTION, true),
        interaction.options.getUser(VOTING_SANCTIONS_PARAMS.USER, true),
      ];

      const buttons = new ActionRowBuilder().addComponents(
        new ButtonBuilder()
          .setCustomId('Yes')
          .setLabel('✅ За')
          .setStyle(ButtonStyle.Success),
        new ButtonBuilder()
          .setCustomId('No')
          .setLabel('✖️ Против')
          .setStyle(ButtonStyle.Danger),
      ) as ActionRowBuilder<MessageActionRowComponentBuilder>;

      const userId = interaction.user.username;
      const actionMapper = new Collection([
        ['mute', 'мут'],
        ['kick', 'изгнание'],
        ['ban', 'бан'],
      ]);
      const votingAction = actionMapper.get(action);
      const until = DateTime.now().plus({ minutes: 3 });
      const remains = Duration.fromObject(
        { seconds: 180 },
        { locale: 'ru' },
      ).toHuman();
      const memberVoters = 5;
      const quorum = Math.ceil(memberVoters * 0.7);
      const status = 'РЕШЕНИЕ НЕ ПРИНЯТО';

      const embed = new EmbedBuilder()
        .setTitle(
          `Количественное голосование за **${votingAction}** к ${user.username}`,
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
