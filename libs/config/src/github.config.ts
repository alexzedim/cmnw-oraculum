import config from 'config';
import { IGitHub } from '@cmnw/config/types';
import { decrypt } from '@cmnw/core';

const GITHUB_CONFIG = config.get<IGitHub>('github');

export const githubConfig: IGitHub = {
  owner: GITHUB_CONFIG.owner,
  repo: GITHUB_CONFIG.repo,
  token: decrypt(GITHUB_CONFIG.token),
};
