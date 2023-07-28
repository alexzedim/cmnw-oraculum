import { PermissionsBitField, SlashCommandBuilder } from 'discord.js';
import { from, lastValueFrom, mergeMap, range } from 'rxjs';
import { DateTime } from 'luxon';
import { Prompts } from '@cmnw/mongo';
import {
  COMMAND_DESCRIPTION_ENUMS,
  COMMAND_ENUMS,
  generateKey,
  GOTD_PARAMS_DESCRIPTION_ENUM,
  TROPHY_PARAMS_ENUM,
  SlashCommand,
} from '@cmnw/commands';

import {
  getRandomReplyByEvent,
  waitForDelay,
  randomMixMax,
  pickRandomFefenya,
  PROMPT_TYPE_ENUM,
  getContest,
  prettyContestPrompt,
  FEFENYA_NAMING,
  CHAT_ROLE_ENUM,
} from '@cmnw/core';

export const trophyContestCommand: SlashCommand = {
  name: COMMAND_ENUMS.FEFENYA_TROPHY,
  description: COMMAND_DESCRIPTION_ENUMS.FEFENYA_TROPHY,
  slashCommand: new SlashCommandBuilder()
    .setName(COMMAND_ENUMS.FEFENYA_TROPHY)
    .setDescription(COMMAND_DESCRIPTION_ENUMS.FEFENYA_TROPHY)
    .addStringOption((option) =>
      option
        .setName(TROPHY_PARAMS_ENUM.TROPHY)
        .setDescription(GOTD_PARAMS_DESCRIPTION_ENUM.TROPHY)
        .setRequired(false),
    )
    .addRoleOption((option) =>
      option
        .setName(TROPHY_PARAMS_ENUM.ROLE)
        .setDescription(GOTD_PARAMS_DESCRIPTION_ENUM.ROLE)
        .setRequired(false),
    ),

  executeInteraction: async function ({ interaction, logger, models, redis }) {
    if (!interaction.isChatInputCommand()) return;

    const { fefenyaModel, promptsModel, contestModel } = models;

    const [trophyRole, trophyName, guildId, clientId, userId, channelId] = [
      interaction.options.getRole(TROPHY_PARAMS_ENUM.ROLE, false),
      interaction.options.getString(TROPHY_PARAMS_ENUM.TROPHY, false),
      interaction.guildId,
      interaction.client.user.id,
      interaction.user.id,
      interaction.channelId,
    ];

    let contest = await getContest(contestModel, guildId);
    const name = FEFENYA_NAMING.random();
    const { guildKey, commandKey } = generateKey({
      command: COMMAND_ENUMS.FEFENYA_TROPHY,
      guildId,
      userId,
    });

    try {
      logger.log(`${COMMAND_ENUMS.FEFENYA_TROPHY} has been triggered`);

      const isCommandInProgress = Boolean(await redis.exists(commandKey));
      if (isCommandInProgress) {
        const isProgressPrompt = await getRandomReplyByEvent(
          models.promptsModel,
          PROMPT_TYPE_ENUM.PROGRESS,
        );

        return await interaction.reply({
          content: isProgressPrompt.text,
          ephemeral: true,
        });
      }

      await redis.set(commandKey, 1, 'EX', 120);
      const cooldownGuildKey = await redis.incr(guildKey);
      const isEphemeral = cooldownGuildKey >= 3;

      if (!contest) {
        try {
          const trophy = trophyName
            ? trophyName
            : trophyRole
            ? trophyRole.name
            : 'пидор';

          const trophyStartPrompts = await promptsModel.find<Prompts>({
            event: PROMPT_TYPE_ENUM.TROPHY,
            type: PROMPT_TYPE_ENUM.CONTEST,
            role: CHAT_ROLE_ENUM.ASSISTANT,
            position: 1,
          });

          const trophyStartingPrompt =
            trophyStartPrompts[randomMixMax(0, trophyStartPrompts.length - 1)];

          contest = await contestModel.create({
            guildId,
            roleId: trophyRole ? trophyRole.id : undefined,
            channelId,
            trophy,
            clientId,
            promptId: trophyStartingPrompt._id,
          });

          const registrationPrompt = await getRandomReplyByEvent(
            models.promptsModel,
            PROMPT_TYPE_ENUM.REGISTRATION,
          );

          const content = prettyContestPrompt(
            registrationPrompt.text,
            name,
            contest.trophy,
          );

          return await interaction.reply({
            content,
            ephemeral: true,
          });
        } catch (validationError) {
          const isValidationPrompt = await getRandomReplyByEvent(
            models.promptsModel,
            PROMPT_TYPE_ENUM.VALIDATION,
          );

          return await interaction.reply({
            content: isValidationPrompt.text,
            ephemeral: true,
          });
        }
      }

      const isWinnerToday =
        DateTime.now().setZone('Europe/Moscow').startOf('day') >
        DateTime.fromJSDate(contest.winnerAt || new Date(0));

      if (isWinnerToday) {
        const commandPrompt = await getRandomReplyByEvent(
          models.promptsModel,
          PROMPT_TYPE_ENUM.COMPLETE,
        );

        const winner = `<@${contest.winnerUserId}>`;

        const content = prettyContestPrompt(
          commandPrompt.text,
          name,
          contest.trophy,
          winner,
        );

        return await interaction.reply({
          content,
          ephemeral: isEphemeral,
        });
      }

      if (cooldownGuildKey >= 2) {
        const ignorePrompt = await getRandomReplyByEvent(
          models.promptsModel,
          PROMPT_TYPE_ENUM.IGNORE,
        );

        const content = prettyContestPrompt(
          ignorePrompt.text,
          name,
          contest.trophy,
        );

        return await interaction.reply({
          content,
          ephemeral: isEphemeral,
        });
      }

      let role;
      let contestPrompt = contest.promptId;
      await interaction.deferReply();

      await lastValueFrom(
        range(1, 10).pipe(
          await mergeMap(async (index) => {
            const seconds = randomMixMax(5, 40);
            await waitForDelay(seconds);
            const currentContestPrompt = await promptsModel.findById(
              contestPrompt,
            );

            if (currentContestPrompt.nextPrompt) {
              contestPrompt = currentContestPrompt.nextPrompt;
              contest.promptId = currentContestPrompt._id;
              await contest.save();
            }

            const currentContent = prettyContestPrompt(
              currentContestPrompt.text,
              name,
              contest.trophy,
              '',
            );

            if (index === 1) {
              await interaction.editReply(currentContent);
            } else {
              await interaction.channel.send({
                content: currentContent,
              });
            }

            if (currentContestPrompt.isLast) {
              const trophyWinner = await pickRandomFefenya(
                fefenyaModel,
                guildId,
              );

              if (contest.roleId) {
                role = interaction.guild.roles.cache.get(contest.roleId);
                const hasPermissions =
                  interaction.guild.members.me.permissions.has(
                    PermissionsBitField.Flags.ManageRoles,
                  );

                const isRoleExists = role && hasPermissions;
                if (isRoleExists && contest.winnerUserId) {
                  const oldTrophyUser = interaction.guild.members.cache.get(
                    contest.winnerUserId,
                  );
                  await oldTrophyUser.roles.remove(role.id);
                }

                if (isRoleExists) {
                  const oldTrophyUser = interaction.guild.members.cache.get(
                    trophyWinner.userId,
                  );
                  await oldTrophyUser.roles.add(role.id);
                }
              }

              const trophyStartPrompts = await promptsModel.find<Prompts>({
                event: PROMPT_TYPE_ENUM.TROPHY,
                type: PROMPT_TYPE_ENUM.CONTEST,
                role: CHAT_ROLE_ENUM.ASSISTANT,
                position: 1,
              });

              const trophyStartingPrompt =
                trophyStartPrompts[
                  randomMixMax(0, trophyStartPrompts.length - 1)
                ];

              contest.promptId = trophyStartingPrompt._id;
              contest.winnerHistory.push(trophyWinner.userId);
              contest.winnerUserId = trophyWinner.userId;
              contest.winnerAt = new Date();

              const promoPrompt = await getRandomReplyByEvent(
                promptsModel,
                PROMPT_TYPE_ENUM.PROMO,
              );

              const winner = `<@${contest.winnerUserId}>`;

              const promoContent = prettyContestPrompt(
                promoPrompt.text,
                name,
                contest.trophy,
                winner,
              );

              await interaction.channel.send({
                content: promoContent,
              });

              await contest.save();
            }
          }, 1),
        ),
      );
    } catch (errorOrException) {
      logger.error(errorOrException);

      const errorPrompt = await getRandomReplyByEvent(
        promptsModel,
        PROMPT_TYPE_ENUM.ERROR,
      );

      const errorContent = prettyContestPrompt(
        errorPrompt.text,
        name,
        contest.trophy,
        '',
      );

      return await interaction.channel.send({
        content: errorContent,
      });
    } finally {
      await redis.del(guildKey);
    }
  },
};
