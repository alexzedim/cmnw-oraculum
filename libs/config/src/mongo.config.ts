import config from 'config';
import { decrypt } from 'cmnw/core';
import { IMongo } from '@cmnw/config';

const MONGO_DB_CONFIG = config.get<IMongo>('mongo');

export const mongoConfig: IMongo = {
  connectionString: decrypt(MONGO_DB_CONFIG.connectionString),
};
