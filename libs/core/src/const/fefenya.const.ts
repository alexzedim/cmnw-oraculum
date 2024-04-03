import { Collection } from 'discord.js';
import { Prompts } from '@cmnw/mongo';
import { CHAT_ROLE_ENUM, EVENT_PROMPT_ENUM, TAGS_ENUM } from '@cmnw/core/enums';

export const FEFENYA_NAMING = new Collection([
  ['Фефеня', 'Фефеня'],
  ['Ефхеня', 'Ефхеня'],
  ['Фефеничная', 'Фефеничная'],
  ['лучшая в мире девочка', 'лучшая в мире девочка'],
  ['Ева Фефеня', 'Ева Фефеня'],
  ['Гномс', 'Великан Великаныч'],
]);

export const FEFENYA_GENERATIVE_PROMPTS: Array<Partial<Prompts>> = [
  {
    onEvent: EVENT_PROMPT_ENUM.REGISTRATION,
    role: CHAT_ROLE_ENUM.USER,
    tags: [TAGS_ENUM.FEFENYA, EVENT_PROMPT_ENUM.REGISTRATION],
    text: 'Придумай фразу, что-бы показать что ты очень занята и выполнишь команду попозже, например через полчаса или час.',
    isGenerated: false,
  },
  {
    onEvent: EVENT_PROMPT_ENUM.PROMO,
    role: CHAT_ROLE_ENUM.USER,
    tags: [TAGS_ENUM.FEFENYA, EVENT_PROMPT_ENUM.PROMO],
    text: "Объяви пожалуйста {winner} победителем конкурса '{trophy} дня'.",
    isGenerated: false,
  },
  {
    onEvent: EVENT_PROMPT_ENUM.TROPHY,
    role: CHAT_ROLE_ENUM.USER,
    tags: [TAGS_ENUM.FEFENYA, EVENT_PROMPT_ENUM.CONTEST],
    text: "Придумай четыре или пять фраз которые покажут процесс как ты определишь кому достанется звание '{trophy} дня' в дискорде.",
    isGenerated: false,
  },
  {
    onEvent: EVENT_PROMPT_ENUM.PROGRESS,
    role: CHAT_ROLE_ENUM.USER,
    tags: [TAGS_ENUM.FEFENYA, EVENT_PROMPT_ENUM.PROGRESS],
    text: 'Придумай фразу, которая покажет что в данный момент команда выполняется, и лучше попробовать через пару минут.',
    isGenerated: false,
  },
  {
    onEvent: EVENT_PROMPT_ENUM.VALIDATION,
    role: CHAT_ROLE_ENUM.USER,
    tags: [
      TAGS_ENUM.FEFENYA,
      EVENT_PROMPT_ENUM.ERROR,
      EVENT_PROMPT_ENUM.VALIDATION,
    ],
    text: 'Придумай фразу которая объяснит что выполняемой команде в дискорде не хватает или роли или названия приза. Что нужно указать или что-то одно, или можно оба.',
    isGenerated: false,
  },
  {
    onEvent: EVENT_PROMPT_ENUM.ERROR,
    role: CHAT_ROLE_ENUM.USER,
    tags: [TAGS_ENUM.FEFENYA, EVENT_PROMPT_ENUM.ERROR],
    text: '{name}, объясни почему выполняемая операция или процесс закончился ошибкой.',
    isGenerated: false,
  },
  {
    onEvent: EVENT_PROMPT_ENUM.IGNORE,
    role: CHAT_ROLE_ENUM.USER,
    tags: [TAGS_ENUM.FEFENYA, EVENT_PROMPT_ENUM.IGNORE],
    text: '{name} представь что тебя раздражает что тебе слишком часто пишут и пригрози игнор-листом.',
    isGenerated: false,
  },
  {
    onEvent: EVENT_PROMPT_ENUM.COMPLETE,
    role: CHAT_ROLE_ENUM.USER,
    tags: [TAGS_ENUM.FEFENYA, EVENT_PROMPT_ENUM.COMPLETE],
    text: "{name} придумай такую фразу, которая покажет что ты уже выбрала '{trophy} дня' на сегодня.",
    isGenerated: false,
  },
];

export const FEFENYA_LOCAL_PROMPTS = new Collection<
  EVENT_PROMPT_ENUM,
  Partial<Prompts>
>([
  [
    EVENT_PROMPT_ENUM.IGNORE,
    {
      onEvent: EVENT_PROMPT_ENUM.IGNORE,
      role: CHAT_ROLE_ENUM.ASSISTANT,
      tags: [TAGS_ENUM.FEFENYA, EVENT_PROMPT_ENUM.IGNORE],
      text: 'чет ты порядком {action} меня {extend}',
      isGenerated: false,
    },
  ],
]);
