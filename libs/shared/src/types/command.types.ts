import { SlashCommandBuilder } from '@discordjs/builders';
import { Redis } from '@nestjs-modules/ioredis';
import { Interaction } from 'discord.js';
import { Logger } from '@nestjs/common';
import { StorageTypes } from '@cmnw/shared/types/storage.types';
import { Repository } from 'typeorm';
import { FefenyaUsersEntity } from '@cmnw/pg';

export interface ISlashCommandArgs {
  readonly interaction: Interaction;
  readonly repository?: Repository<FefenyaUsersEntity>; // TODO as repo storage
  readonly localStorage?: StorageTypes;
  readonly logger: Logger;
  readonly redis?: Redis;
}

export interface ISlashCommand {
  readonly name: string;

  readonly description: string;

  readonly guildOnly: boolean;

  readonly slashCommand: Omit<
    SlashCommandBuilder,
    'addSubcommand' | 'addSubcommandGroup'
  >;

  executeInteraction(interactionArgs: ISlashCommandArgs): Promise<void>;
}
