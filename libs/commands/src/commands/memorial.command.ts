import { SlashCommand } from '@cmnw/commands/types';
import { MEMORIAL, MEMORIAL_ENUM } from '@cmnw/commands/const';
import { Octokit } from 'octokit';
import { githubConfig } from '@cmnw/config';
import { CMNW_MEMORIAL_DEDICATIONS } from '@cmnw/core';
import { memorialBoardEmbed } from '@cmnw/commands/components';

export const memorialCommand: SlashCommand = {
  name: MEMORIAL_ENUM.NAME,
  description: MEMORIAL_ENUM.DESCRIPTION,
  slashCommand: MEMORIAL,

  async executeInteraction({ interaction, models, logger }): Promise<void> {
    if (!interaction.isChatInputCommand()) return;
    try {
      logger.log(`${MEMORIAL_ENUM.NAME} triggered by ${interaction.user.id}`);

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

      const memorialBoard = memorialBoardEmbed(
        repo.full_name,
        repo.html_url,
        repo.description,
        new Date(repo.created_at),
        interaction.user.avatar,
      );

      const memorials = CMNW_MEMORIAL_DEDICATIONS.get(
        interaction.user.username,
      );

      for (const { name, value } of memorials) {
        memorialBoard.addFields({
          name: name,
          value: value,
          inline: true,
        });
      }

      for (const { login, url, contributions } of contributors) {
        memorialBoard.addFields({
          name: `${contributions}`,
          value: `[${login}](${url})`,
          inline: true,
        });
      }

      interaction.reply({ embeds: [memorialBoard], ephemeral: false });
    } catch (errorOrException) {
      this.logger.error(errorOrException);
      await interaction.reply({
        content: errorOrException.message,
        ephemeral: true,
      });
    }
  },
};
