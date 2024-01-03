import { SlashCommandBuilder } from '@discordjs/builders';

export enum CONTEST_BIND_ENUM {
  NAME = 'bind',
  DESCRIPTION = 'Прикрепи подарочную роль для победителя',
  CHANNEL_OPTION = 'канал',
  ROLE_OPTION = 'роль',
  TITLE_OPTION = 'описание',
}

export enum CONTEST_BIND_DESCRIPTION_PARAMS {
  CHANNEL = 'Текстовый канал для анонсментов',
  TITLE = "Назови что разыгрываем, ну например 'котик дня', так будет смешнее)",
}

export enum CONTEST_START_ENUM {
  NAME = 'start',
  DESCRIPTION = 'Погнали роллить победителя дня',
}

export enum CONTEST_TOP_ENUM {
  NAME = 'top',
  DESCRIPTION = 'Показать топ',
}

export const CONTEST_BIND = new SlashCommandBuilder()
  .setName(CONTEST_BIND_ENUM.NAME)
  .setDescription(CONTEST_BIND_ENUM.DESCRIPTION)
  .addChannelOption((option) =>
    option
      .setName(CONTEST_BIND_ENUM.CHANNEL_OPTION)
      .setDescription(CONTEST_BIND_DESCRIPTION_PARAMS.CHANNEL)
      .setRequired(true),
  )
  .addRoleOption((option) =>
    option
      .setName(CONTEST_BIND_ENUM.ROLE_OPTION)
      .setDescription(CONTEST_BIND_ENUM.ROLE_OPTION)
      .setRequired(true),
  )
  .addStringOption((option) =>
    option
      .setName(CONTEST_BIND_ENUM.TITLE_OPTION)
      .setDescription(CONTEST_BIND_DESCRIPTION_PARAMS.TITLE)
      .setRequired(true),
  );

export const CONTEST_START = new SlashCommandBuilder()
  .setName(CONTEST_START_ENUM.NAME)
  .setDescription(CONTEST_START_ENUM.DESCRIPTION);

export const CONTEST_TOP = new SlashCommandBuilder()
  .setName(CONTEST_TOP_ENUM.NAME)
  .setDescription(CONTEST_TOP_ENUM.DESCRIPTION);
