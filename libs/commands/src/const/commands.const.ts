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

export enum IDENTITY_ENUM {
  NAME = 'identity',
  DESCRIPTION = 'Привязать выбранную сущность',
  PROFILE_OPTION = 'профиль',
}

export const IDENTITY = new SlashCommandBuilder()
  .setName(IDENTITY_ENUM.NAME)
  .setDescription(IDENTITY_ENUM.DESCRIPTION)
  .addStringOption((option) =>
    option
      .setName(IDENTITY_ENUM.PROFILE_OPTION)
      .setDescription('профиль')
      .setRequired(true),
  );
