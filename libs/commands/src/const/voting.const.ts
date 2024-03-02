import { SlashCommandBuilder } from '@discordjs/builders';
import { Collection } from 'discord.js';

export const VOTING_KEY = 'VOTING_KEY';

export const VOTING_NOMINATION_ACTION = new Map<string, string>([
  ['1', 'назначение на роль'],
  ['2', 'освобождение от указанной роли'],
  ['3', 'присвоение роли'],
  ['4', 'лишение роли'],
]);

export const VOTING_SANCTIONS_ACTION = new Collection([
  ['mute', 'мут'],
  ['kick', 'изгнание'],
  ['ban', 'бан'],
  ['unmute', 'снять мут'],
  ['unban', 'разбан'],
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

export enum VOTING_SANCTIONS_ENUM {
  NAME = 'vote-sanctions',
  DESCRIPTION = 'Инициировать процедуру голосования за применение санкций к участнику сообщества',
  ACTION_OPTION = 'санкции',
  MODE_OPTION = 'режим',
  USER_OPTION = 'участник',
  ROLE_OPTION = 'роль',
  ACTION_DESCRIPTION = 'санкционированное действие',
  USER_DESCRIPTION = 'участник сообщества',
  ROLE_DESCRIPTION = 'голосуют только те, кто выше',
}

export enum VOTING_MODE_ENUM_PARAMS {
  CT = 'временное-внутри-канальное',
  C = 'общее-внутри-канальное',
  BAN = 'Забанить',
  UNBAN = 'Разбанить',
  UNMUTE = 'Размутать',
}

export enum VOTING_ACTION_PARAMS {
  MUTE = 'Мут',
  KICK = 'Изгнать',
  BAN = 'Забанить',
  UNBAN = 'Разбанить',
  UNMUTE = 'Размутать',
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

export const VOTING_SANCTIONS = new SlashCommandBuilder()
  .setName(VOTING_SANCTIONS_ENUM.NAME)
  .setDescription(VOTING_SANCTIONS_ENUM.DESCRIPTION)
  .addStringOption((option) =>
    option
      .setName(VOTING_SANCTIONS_ENUM.ACTION_OPTION)
      .setDescription(VOTING_SANCTIONS_ENUM.ACTION_DESCRIPTION)
      .setRequired(true)
      .addChoices(
        { name: VOTING_ACTION_PARAMS.MUTE, value: 'mute' },
        { name: VOTING_ACTION_PARAMS.BAN, value: 'ban' },
        { name: VOTING_ACTION_PARAMS.KICK, value: 'kick' },
        { name: VOTING_ACTION_PARAMS.UNBAN, value: 'unban' },
        { name: VOTING_ACTION_PARAMS.UNMUTE, value: 'unmute' },
      ),
  )
  .addStringOption((option) =>
    option
      .setName(VOTING_SANCTIONS_ENUM.ACTION_OPTION)
      .setDescription(VOTING_SANCTIONS_ENUM.ACTION_DESCRIPTION)
      .setRequired(true)
      .addChoices(
        { name: VOTING_ACTION_PARAMS.MUTE, value: 'mute' },
        { name: VOTING_ACTION_PARAMS.BAN, value: 'ban' },
        { name: VOTING_ACTION_PARAMS.KICK, value: 'kick' },
        { name: VOTING_ACTION_PARAMS.UNBAN, value: 'unban' },
        { name: VOTING_ACTION_PARAMS.UNMUTE, value: 'unmute' },
      ),
  )
  .addUserOption((option) =>
    option
      .setName(VOTING_SANCTIONS_ENUM.USER_OPTION)
      .setDescription(VOTING_SANCTIONS_ENUM.USER_DESCRIPTION)
      .setRequired(true),
  )
  .addRoleOption((option) =>
    option
      .setName(VOTING_SANCTIONS_ENUM.ROLE_OPTION)
      .setDescription(VOTING_SANCTIONS_ENUM.ROLE_DESCRIPTION)
      .setRequired(false),
  );
