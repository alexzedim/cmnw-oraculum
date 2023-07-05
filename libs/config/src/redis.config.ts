import config from 'config';
import { decrypt } from '@cmnw/core';
import { RedisConfigInterface } from '@cmnw/config/types';

const REDIS_CONFIG = config.get<RedisConfigInterface>('redis');

export const redisConfig: RedisConfigInterface = {
  host: decrypt(REDIS_CONFIG.host),
  port: REDIS_CONFIG.port,
  password: decrypt(REDIS_CONFIG.password),
};
