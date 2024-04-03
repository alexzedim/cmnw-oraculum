import { Memorials } from '@cmnw/core/types';
import {
  ACTION_TRIGGER_FLAG,
  CMNW_ORACULUM_PROJECTS,
  STATUS_ENUM,
} from '@cmnw/core/enums';

export const CIPHER_AES_128 = 'aes-128-ecb';

export const CIPHER_AES_256 = 'aes-256-cbc';

export const KEY_STATUS_ARRAY = Object.values(STATUS_ENUM);

export const ROUTING_KEY = [
  ACTION_TRIGGER_FLAG.MESSAGE_PROVOKE,
  ACTION_TRIGGER_FLAG.MESSAGE_REPLY,
];

export const MEMORIAL_DEDICATIONS = new Map<string, Memorials>([
  [
    CMNW_ORACULUM_PROJECTS.RAINY,
    [
      {
        name: '*Designed by*',
        value: 'rainon',
      },
      {
        name: '*Inspired by*',
        value: 'jarisse',
      },
    ],
  ],
  [
    CMNW_ORACULUM_PROJECTS.PEPA,
    [
      {
        name: '*Designed by*',
        value: 'alexzeim | .nims',
      },
      {
        name: '*Inspired by*',
        value: 'jarisse',
      },
      {
        name: '*Dedicated to*',
        value: new Buffer('bGlzYWVsMQ==', 'base64').toString('ascii'),
      },
    ],
  ],
  [
    CMNW_ORACULUM_PROJECTS.RODRIGA,
    [
      {
        name: '*Designed by*',
        value: '.rodriguez',
      },
    ],
  ],
  [
    CMNW_ORACULUM_PROJECTS.FEFENYA,
    [
      {
        name: '*Designed & Inspired by*',
        value: 'efhen',
      },
    ],
  ],
]);

export const EMOJIS_EVENT_KEYS = new Map([
  ['messageReactionAdd', 1],
  ['messageReactionRemove', -1],
]);
