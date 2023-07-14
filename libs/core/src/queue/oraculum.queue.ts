import { ORACULUM_QUEUE } from '@cmnw/core/enums';

export const oraculumQueue = {
  name: ORACULUM_QUEUE.ORACULUM,
  type: 'topic',
  createExchangeIfNotExists: true,
};

export const testQueue = {
  name: ORACULUM_QUEUE.RPC_EXCHANGE,
  type: 'direct',
  createExchangeIfNotExists: true,
};
