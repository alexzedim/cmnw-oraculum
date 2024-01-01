import { SlashCommandBuilder } from '@discordjs/builders';

export const VOTING_ACTION = new Map<string, string>([
  ['1', 'назначение на роль'],
  ['2', 'освобождение от указанной роли'],
  ['3', 'присвоение роли'],
  ['4', 'лишение роли'],
]);

export const buildVotingAction = (
  userId: string,
  roleId: string,
  isDemoted: boolean,
) => {
  const action = {
    title: `Голосование за присвоение роли`,
    description: `Назначить <@${userId}> на роль <@&${roleId}>`,
  };

  if (isDemoted) {
    action.title = `Голосование за освобождение от указанной роли`;
    action.description = `Освободить участника сообщества <@${userId}> от роли <@&${roleId}>`;
  }

  return action;
};

export enum VOTING_NOMINATION_ENUM {
  NAME = 'vote-nomination',
  DESCRIPTION = 'Номинировать участника сообщества к присвоению роли',
  ROLE_OPTION = 'роль',
  NAME_OPTION = 'участник',
}

export enum VOTING_PROPOSAL_ENUM {
  NAME = 'vote-proposal',
  DESCRIPTION = 'Представить предложение к общественной оценке',
}

export const VOTING_NOMINATION = new SlashCommandBuilder()
  .setName(VOTING_NOMINATION_ENUM.NAME)
  .setDescription(VOTING_NOMINATION_ENUM.DESCRIPTION)
  .addRoleOption((option) =>
    option
      .setName(VOTING_NOMINATION_ENUM.ROLE_OPTION)
      .setDescription('номинированная роль')
      .setRequired(true),
  )
  .addUserOption((option) =>
    option
      .setName(VOTING_NOMINATION_ENUM.NAME_OPTION)
      .setDescription('участник сообщества')
      .setRequired(true),
  );

export const VOTING_PROPOSAL = new SlashCommandBuilder()
  .setName(VOTING_PROPOSAL_ENUM.NAME)
  .setDescription(VOTING_PROPOSAL_ENUM.DESCRIPTION);
