import config from 'config';
import { YandexConfigInterface } from '@cmnw/config/types';
import { decrypt } from '@cmnw/core';

const YANDEX_CONFIG = config.get<YandexConfigInterface>('yandex');

const [token, key, secret, folderId] = [
  decrypt(YANDEX_CONFIG.token),
  decrypt(YANDEX_CONFIG.key),
  decrypt(YANDEX_CONFIG.secret),
  YANDEX_CONFIG.folderId,
];

export const yandexConfig: YandexConfigInterface = {
  token: token,
  key: key,
  secret: secret,
  folderId: folderId,
};
