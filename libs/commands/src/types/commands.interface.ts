import { Interaction } from 'discord.js';
import { Logger } from '@nestjs/common';
import { Redis } from '@nestjs-modules/ioredis';
import { Model } from 'mongoose';
import { AmqpConnection } from '@golevelup/nestjs-rabbitmq';
import {
  Fefenya,
  Permissions,
  Event,
  Channels,
  Roles,
  Prompts,
  Guilds,
} from '@cmnw/mongo';
import { COMMAND_ENUMS } from '@cmnw/commands/enums';

export interface IModels {
  fefenyaModel: Model<Fefenya>;
  permissionsModel: Model<Permissions>;
  channelsModel: Model<Channels>;
  eventModel: Model<Event>;
  rolesModel: Model<Roles>;
  promptsModel: Model<Prompts>;
  guildsModel: Model<Guilds>;
}

export interface ISlashCommandArgs {
  interaction: Interaction;
  logger: Logger;
  models?: Partial<IModels>;
  redis?: Redis;
  rabbit?: AmqpConnection;
}

export interface ISlashCommand {
  name: string;
  description: string;
  slashCommand: any; // TODO SlashCommandBuilder
  executeInteraction(args: ISlashCommandArgs): Promise<unknown>;
}

export interface ICacheArgs {
  command: COMMAND_ENUMS;
  guildId: string;
  userId: string;
}

export interface ICacheResult {
  userKey: string;
  guildKey: string;
  commandKey: string;
}
