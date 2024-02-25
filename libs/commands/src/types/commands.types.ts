import { ISlashInteraction } from '@cmnw/commands/types/commands.interface';

export type SlashCommand = Readonly<ISlashInteraction>;

export type SlashModel = Omit<ISlashInteraction, 'slashCommand'>;
