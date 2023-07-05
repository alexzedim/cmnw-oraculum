import { ORACULUM_QUEUE, TEST_QUEUE } from '@cmnw/core/const';

export const oraculumQueue = {
  name: ORACULUM_QUEUE,
  type: 'topic',
  createExchangeIfNotExists: true,
};

export const testQueue = {
  name: TEST_QUEUE,
  type: 'direct',
  createExchangeIfNotExists: true,
};
