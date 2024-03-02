import { SlashCommandBuilder } from '@discordjs/builders';

export enum VISITORS_PASS_ENUM {
  NAME = 'visitors-pass',
  DESCRIPTION = 'Создать адресное приглашение для посетителя',
}

export enum VISITORS_USER_ENUM {
  NAME = 'userId',
  DESCRIPTION = 'Snowflake UID',
}

export enum VISITORS_TEMP_ENUM {
  NAME = 'temporary',
  DESCRIPTION = 'Is Temporary',
}

export enum VISITORS_EXP_ENUM {
  NAME = 'expire',
  DESCRIPTION = 'Expiration Time',
  M30 = '30',
  H1 = '60',
  H6 = '360',
  H12 = '720',
  DAY = '1440',
}

export enum VISITORS_CHANNEL_ENUM {
  NAME = 'channel',
  DESCRIPTION = 'Bypass to Channel ID',
}

export const VISITORS_PASS = new SlashCommandBuilder()
  .setName(VISITORS_PASS_ENUM.NAME)
  .setDescription(VISITORS_PASS_ENUM.DESCRIPTION)
  .addStringOption((option) =>
    option
      .setName(VISITORS_USER_ENUM.NAME)
      .setDescription(VISITORS_USER_ENUM.DESCRIPTION)
      .setRequired(true),
  )
  .addBooleanOption((option) =>
    option
      .setName(VISITORS_TEMP_ENUM.NAME)
      .setDescription(VISITORS_TEMP_ENUM.NAME)
      .setRequired(true),
  )
  .addStringOption((option) =>
    option
      .setName(VISITORS_EXP_ENUM.NAME)
      .setDescription(VISITORS_EXP_ENUM.DESCRIPTION)
      .setRequired(false)
      .addChoices(
        {
          name: VISITORS_EXP_ENUM.M30,
          value: VISITORS_EXP_ENUM.M30,
        },
        {
          name: VISITORS_EXP_ENUM.H1,
          value: VISITORS_EXP_ENUM.H1,
        },
        {
          name: VISITORS_EXP_ENUM.H6,
          value: VISITORS_EXP_ENUM.H6,
        },
        {
          name: VISITORS_EXP_ENUM.H12,
          value: VISITORS_EXP_ENUM.H12,
        },
        {
          name: VISITORS_EXP_ENUM.DAY,
          value: VISITORS_EXP_ENUM.DAY,
        },
      ),
  )
  .addChannelOption((option) =>
    option
      .setName(VISITORS_CHANNEL_ENUM.NAME)
      .setDescription(VISITORS_CHANNEL_ENUM.DESCRIPTION)
      .setRequired(false),
  );
