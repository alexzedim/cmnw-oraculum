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

export const chatQueue = {
  name: ORACULUM_QUEUE.CHAT,
  type: 'direct',
  createExchangeIfNotExists: true,
};

export const voiceQueue = {
  name: ORACULUM_QUEUE.VOICE,
  type: 'direct',
  createExchangeIfNotExists: true,
};

export const messageQueue = {
  name: ORACULUM_QUEUE.MESSAGES,
  type: 'direct',
  createExchangeIfNotExists: true,
};

export const eventsQueue = {
  name: ORACULUM_QUEUE.EVENTS,
  type: 'direct',
  createExchangeIfNotExists: true,
};
