import { join } from 'path';
import { util } from 'config';
import {
  RedisConfigInterface,
  RedisInterface,
} from '@app/configuration/interfaces';

const configDir = join(__dirname, '..', '..', '..', 'config');
const { redis }: RedisInterface = util.loadFileConfigs(configDir);

export const redisConfig: RedisConfigInterface = {
  host: redis.host,
  port: redis.port,
  password: redis.password,
};
