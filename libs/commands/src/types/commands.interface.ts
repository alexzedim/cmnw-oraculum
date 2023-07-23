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
