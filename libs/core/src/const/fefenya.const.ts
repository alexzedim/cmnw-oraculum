import { Collection } from 'discord.js';
import { Prompts } from '@cmnw/mongo';
import {
  CHAT_ROLE_ENUM,
  OPENAI_MODEL,
  PROMPT_TYPE_ENUM,
  TAGS_ENUM,
} from '@cmnw/core/enums';

export const FEFENYA_NAMING = new Collection([
  ['Фефеня', 'Фефеня'],
  ['Ефхеня', 'Ефхеня'],
  ['Фефеничная', 'Фефеничная'],
  ['Расфуфеня', 'Расфуфеня'],
  [
    'ваша любимая и неподраждаемая Фефенадзе',
    'ваша любимая и неподраждаемая Фефенадзе',
  ],
  ['Ева Фефенистая', 'Ева Фефенистая'],
]);

export const FEFENYA_PROMPTS: Array<Partial<Prompts>> = [
  {
    model: OPENAI_MODEL.ChatGPT_4,
    event: PROMPT_TYPE_ENUM.REGISTRATION,
    type: PROMPT_TYPE_ENUM.REGISTRATION,
    role: CHAT_ROLE_ENUM.USER,
    tags: [TAGS_ENUM.FEFENYA, PROMPT_TYPE_ENUM.REGISTRATION],
    text: 'Придумай фразу, что-бы показать что ты очень занята и выполнишь команду попозже, например через полчаса или час.',
  },
  {
    model: OPENAI_MODEL.ChatGPT_4,
    event: PROMPT_TYPE_ENUM.PROMO,
    type: PROMPT_TYPE_ENUM.PROMO,
    role: CHAT_ROLE_ENUM.USER,
    tags: [TAGS_ENUM.FEFENYA, PROMPT_TYPE_ENUM.PROMO],
    text: "Объяви пожалуйста {winner} победителем конкурса '{trophy} дня'.",
  },
  {
    model: OPENAI_MODEL.ChatGPT_4,
    event: PROMPT_TYPE_ENUM.TROPHY,
    type: PROMPT_TYPE_ENUM.CONTEST,
    role: CHAT_ROLE_ENUM.USER,
    tags: [TAGS_ENUM.FEFENYA, PROMPT_TYPE_ENUM.CONTEST],
    text: "Придумай четыре или пять фраз которые покажут процесс как ты определишь кому достанется звание '{trophy} дня' в дискорде.",
  },
  {
    model: OPENAI_MODEL.ChatGPT_4,
    event: PROMPT_TYPE_ENUM.PROGRESS,
    type: PROMPT_TYPE_ENUM.PROGRESS,
    role: CHAT_ROLE_ENUM.USER,
    tags: [TAGS_ENUM.FEFENYA, PROMPT_TYPE_ENUM.PROGRESS],
    text: 'Придумай фразу, которая покажет что в данный момент команда выполняется, и лучше попробовать через пару минут.',
  },
  {
    model: OPENAI_MODEL.ChatGPT_4,
    event: PROMPT_TYPE_ENUM.VALIDATION,
    type: PROMPT_TYPE_ENUM.VALIDATION,
    role: CHAT_ROLE_ENUM.USER,
    tags: [
      TAGS_ENUM.FEFENYA,
      PROMPT_TYPE_ENUM.ERROR,
      PROMPT_TYPE_ENUM.VALIDATION,
    ],
    text: 'Придумай фразу которая объяснит что выполняемой команде в дискорде не хватает или роли или названия приза. Что нужно указать или что-то одно, или можно оба.',
  },
  {
    model: OPENAI_MODEL.ChatGPT_4,
    event: PROMPT_TYPE_ENUM.ERROR,
    type: PROMPT_TYPE_ENUM.ERROR,
    role: CHAT_ROLE_ENUM.USER,
    tags: [TAGS_ENUM.FEFENYA, PROMPT_TYPE_ENUM.ERROR],
    text: '{name}, объясни почему выполняемая операция или процесс закончился ошибкой.',
  },
  {
    model: OPENAI_MODEL.ChatGPT_4,
    event: PROMPT_TYPE_ENUM.IGNORE,
    type: PROMPT_TYPE_ENUM.IGNORE,
    role: CHAT_ROLE_ENUM.USER,
    tags: [TAGS_ENUM.FEFENYA, PROMPT_TYPE_ENUM.IGNORE],
    text: '{name} представь что тебя раздражает что тебе слишком часто пишут и пригрози игнор-листом.',
  },
  {
    model: OPENAI_MODEL.ChatGPT_4,
    event: PROMPT_TYPE_ENUM.COMPLETE,
    type: PROMPT_TYPE_ENUM.COMPLETE,
    role: CHAT_ROLE_ENUM.USER,
    tags: [TAGS_ENUM.FEFENYA, PROMPT_TYPE_ENUM.COMPLETE],
    text: "{name} придумай такую фразу, которая покажет что ты уже выбрала '{trophy} дня' на сегодня.",
  },
];
