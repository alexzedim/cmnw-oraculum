import { ISlashCommand, ISlashCommandArgs } from '@cmnw/shared';
import { SlashCommandBuilder } from '@discordjs/builders';
import { IDENTITY_STATUS_ENUM, PepaIdentityEntity } from '@cmnw/pg';
import { Repository } from 'typeorm';
import { EmbedBuilder } from 'discord.js';

export const Identity: ISlashCommand = {
  name: 'identity',
  description: 'Force use selected identity by default',
  guildOnly: true,
  slashCommand: new SlashCommandBuilder()
    .setName('identity')
    .setDescription('Force using selected identity by default')
    .addStringOption((option) =>
      option.setName('identity').setDescription('Codename').setRequired(true),
    ),

  async executeInteraction({
    interaction,
    repository,
  }: ISlashCommandArgs): Promise<void> {
    if (!interaction.isChatInputCommand() || !repository) return;

    const name = interaction.options.getString('identity');

    let embed = new EmbedBuilder()
      .setColor(0x0099ff)
      .setTitle(`Identity model ${name} not found!`)
      .setFooter({
        text: 'Managed & operated by CMNW. Dedicated to Kristina | LisaeL',
        iconURL: 'https://i.imgur.com/OBDcu7K.png',
      });

    let identityEntity = await (
      repository as Repository<PepaIdentityEntity>
    ).findOneBy({ name });

    if (!identityEntity) {
      await interaction.reply({ embeds: [embed], ephemeral: true });
      return;
    }

    if (identityEntity) {
      await (repository as Repository<PepaIdentityEntity>).update(
        { status: IDENTITY_STATUS_ENUM.ACTIVE },
        { status: IDENTITY_STATUS_ENUM.ENABLED },
      );

      identityEntity = await (
        repository as Repository<PepaIdentityEntity>
      ).save({
        status: IDENTITY_STATUS_ENUM.ACTIVE,
      });
    }

    embed = new EmbedBuilder()
      .setColor(0x0099ff)
      .setTitle(identityEntity.name)
      .setDescription(
        `Identity model has been set to ${IDENTITY_STATUS_ENUM.ACTIVE} successfully.`,
      )
      .setTimestamp(identityEntity.updatedAt)
      .setThumbnail(identityEntity.avatar)
      .setFooter({
        text: 'Managed & operated by CMNW. Dedicated to Kristina | LisaeL',
        iconURL: 'https://i.imgur.com/OBDcu7K.png',
      });

    await interaction.reply({ embeds: [embed], ephemeral: true });
  },
};
