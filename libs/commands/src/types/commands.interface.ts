import { Interaction } from 'discord.js';
import { Logger } from '@nestjs/common';
import { Redis } from '@nestjs-modules/ioredis';
import { SlashCommandBuilder } from '@discordjs/builders';
import { UsersFefenya, Permissions } from '@cmnw/mongo';
import { Model } from 'mongoose';

export interface IModels {
  usersFefenyaModel: Model<UsersFefenya>;
  permissions: Model<Permissions>;
}

export interface ISlashCommandArgs {
  interaction: Interaction;
  logger: Logger;
  models?: Partial<IModels>;
  redis?: Redis;
}

export interface ISlashCommand {
  name: string;

  description: string;

  slashCommand: any;

  executeInteraction(args: ISlashCommandArgs): Promise<void>;
}
