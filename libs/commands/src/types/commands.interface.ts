import { Interaction } from 'discord.js';
import { Logger } from '@nestjs/common';
import { Redis } from '@nestjs-modules/ioredis';
import { UsersFefenya, Permissions, Logs, Channels } from '@cmnw/mongo';
import { Model } from 'mongoose';

export interface IModels {
  usersFefenyaModel: Model<UsersFefenya>;
  permissionsModel: Model<Permissions>;
  channelsModel: Model<Channels>;
  logsModel: Model<Logs>;
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

  slashCommand: any; // TODO SlashCommandBuilder

  executeInteraction(args: ISlashCommandArgs): Promise<void>;
}
