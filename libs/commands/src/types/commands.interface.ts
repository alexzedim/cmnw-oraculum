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
} from '@cmnw/mongo';

export interface IModels {
  usersFefenyaModel: Model<Fefenya>;
  permissionsModel: Model<Permissions>;
  channelsModel: Model<Channels>;
  eventModel: Model<Event>;
  rolesModel: Model<Roles>;
  prompts: Model<Prompts>;
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
  executeInteraction(args: ISlashCommandArgs): Promise<void>;
}
