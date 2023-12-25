import { SlashCommandBuilder } from '@discordjs/builders';

export const VOTING_QUORUM = {

}

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
