import { PEPA_TRIGGER_FLAG, STATUS_ENUM } from 'cmnw/core/enums';

export const RPC_EXCHANGE = 'rpc-queue';
export const ORACULUM_QUEUE = 'oraculum';
export const TEST_QUEUE = 'rpc-queue';

export const MESSAGE_QUEUE = 'message';
export const SPEECH_QUEUE = 'speech';
export const QUESTION_QUEUE = 'question';
export const CIPHER_ALGO_AES = 'aes-128-ecb';

export const KEY_STATUS_ARRAY = Object.values(STATUS_ENUM);

export const ROUTING_KEY = [
  PEPA_TRIGGER_FLAG.MESSAGE_PROVOKE,
  PEPA_TRIGGER_FLAG.MESSAGE_REPLY,
];
