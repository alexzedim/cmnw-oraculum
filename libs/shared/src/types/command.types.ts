import { SlashCommandBuilder } from '@discordjs/builders';
import { Redis } from '@nestjs-modules/ioredis';
import { Interaction } from 'discord.js';
import { Logger } from '@nestjs/common';
import { StorageTypes } from '@cmnw/shared/types/storage.types';
import { Repository } from 'typeorm';
import { FefenyaUsersEntity, PepaIdentityEntity } from '@cmnw/pg';

export interface ISlashCommandArgs {
  readonly interaction: Interaction;
  readonly logger: Logger;
  readonly repository?: Repository<FefenyaUsersEntity | PepaIdentityEntity>; // TODO as repo storage
  readonly localStorage?: StorageTypes;
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
