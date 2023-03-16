import { join } from 'path';
import {
  YandexConfigInterface,
  YandexInterface,
} from '@app/configuration/interfaces';
import { util } from 'config';

const configDir = join(__dirname, '..', '..', '..', 'config');
const { yandex }: YandexInterface = util.loadFileConfigs(configDir);

export const yandexConfig: YandexConfigInterface = {
  token: yandex.token,
};
