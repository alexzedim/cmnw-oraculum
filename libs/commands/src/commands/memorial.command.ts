import { SlashCommand } from '@cmnw/commands/types';
import { COMMAND_DESCRIPTION_ENUMS, COMMAND_ENUMS } from '@cmnw/commands/const';
import { SlashCommandBuilder } from '@discordjs/builders';
import { Octokit } from 'octokit';
import { githubConfig } from '@cmnw/config';
import { EmbedBuilder } from 'discord.js';
import { CMNW_MEMORIAL_DEDICATIONS } from '@cmnw/core';

export const memorialCommand: SlashCommand = {
  name: COMMAND_ENUMS.MEMORIAL,
  description: COMMAND_DESCRIPTION_ENUMS.MEMORIAL,
  slashCommand: new SlashCommandBuilder()
    .setName(COMMAND_ENUMS.MEMORIAL)
    .setDescription(COMMAND_ENUMS.MEMORIAL),

  async executeInteraction({ interaction, models, logger }): Promise<void> {
    if (!interaction.isChatInputCommand()) return;
    try {
      const octokit = new Octokit({
        auth: githubConfig.token,
      });

      const [{ data: repo }, { data: contributors }] = await Promise.all([
        octokit.request('GET /repos/{owner}/{repo}', {
          owner: githubConfig.owner,
          repo: githubConfig.repo,
        }),
        octokit.request('GET /repos/{owner}/{repo}/contributors', {
          owner: githubConfig.owner,
          repo: githubConfig.repo,
        }),
      ]);

      const embed = new EmbedBuilder()
        .setColor(0x0099ff)
        .setTitle(repo.full_name)
        .setURL(repo.html_url)
        .setDescription(repo.description)
        .setTimestamp(new Date(repo.created_at))
        .setFooter({
          text: 'Managed & operated by CMNW',
          iconURL: 'https://i.imgur.com/OBDcu7K.png',
        });

      embed.setThumbnail(interaction.user.avatar);

      const memorials = CMNW_MEMORIAL_DEDICATIONS.get(
        interaction.user.username,
      );

      for (const { name, value } of memorials) {
        embed.addFields({
          name: name,
          value: value,
          inline: true,
        });
      }

      for (const { login, url, contributions } of contributors) {
        embed.addFields({
          name: `${contributions}`,
          value: `[${login}](${url})`,
          inline: true,
        });
      }

      interaction.reply({ embeds: [embed], ephemeral: false });
    } catch (errorOrException) {
      this.logger.error(errorOrException);
      await interaction.reply({
        content: errorOrException.message,
        ephemeral: true,
      });
    }
  },
};
