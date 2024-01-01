import { SlashCommandBuilder } from '@discordjs/builders';

export enum MEMORIAL_ENUM {
  NAME = 'memorial',
  DESCRIPTION = 'Посмотреть список участников',
}

export const MEMORIAL = new SlashCommandBuilder()
  .setName(MEMORIAL_ENUM.NAME)
  .setDescription(MEMORIAL_ENUM.DESCRIPTION);
