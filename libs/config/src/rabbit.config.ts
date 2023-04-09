import { join } from 'path';
import { util } from 'config';
import { RabbitConfigInterface, RabbitInterface } from '@cmnw/config/types';

const configDir = join(__dirname, '..', '..', '..', 'config');
const { rabbit }: RabbitInterface = util.loadFileConfigs(configDir);

export const rabbitConfig: RabbitConfigInterface = {
  user: rabbit.user,
  password: rabbit.password,
  host: rabbit.host,
  port: rabbit.port,
  uri: `amqp://${rabbit.user}:${rabbit.password}@${rabbit.host}:${rabbit.port}`,
};
