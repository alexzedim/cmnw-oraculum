import config from 'config';
import { decrypt } from '@cmnw/core';
import { RabbitConfigInterface } from '@cmnw/config/types';

const RABBIT_CONFIG = config.get<RabbitConfigInterface>('rabbit');

const [user, password, host, port] = [
  decrypt(RABBIT_CONFIG.user),
  decrypt(RABBIT_CONFIG.password),
  decrypt(RABBIT_CONFIG.host),
  RABBIT_CONFIG.port,
];

const uri = `amqp://${user}:${password}@${host}:${port}`;

export const rabbitConfig: RabbitConfigInterface = {
  user: user,
  password: password,
  host: host,
  port: port,
  uri: uri,
};
