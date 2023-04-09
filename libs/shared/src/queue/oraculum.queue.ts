import { ORACULUM_EXCHANGE } from '@cmnw/shared/const';

export const oraculumQueue = {
  name: ORACULUM_EXCHANGE,
  type: 'topic',
  createExchangeIfNotExists: true,
};
