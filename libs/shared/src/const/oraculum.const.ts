import { PEPA_TRIGGER_FLAG } from '@cmnw/shared/enums';

export const ORACULUM_EXCHANGE = 'oraculum';
export const MESSAGE_QUEUE = 'message';

export const ROUTING_KEY = [
  PEPA_TRIGGER_FLAG.MESSAGE_PROVOKE,
  PEPA_TRIGGER_FLAG.MESSAGE_REPLY,
];
