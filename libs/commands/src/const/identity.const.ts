import { SlashCommandBuilder } from '@discordjs/builders';

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
