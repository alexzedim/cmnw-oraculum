import { AmqpConnection } from '@golevelup/nestjs-rabbitmq';
import { ChatDto, ReplyDto } from '@cmnw/core/dto';
import { Model } from 'mongoose';
import { Prompts } from '@cmnw/mongo';
import { chatQueue } from '@cmnw/core/queue';
import { getPrompt } from '@cmnw/core/dao/prompts.dao';
import { EVENT_PROMPT_ENUM } from '@cmnw/core/enums';
import { random } from '@cmnw/core/utils';

/**
 * @description Probably store smth in redis cache
 */
export const sayOnEvent = async (
  amqpConnection: AmqpConnection,
  promptModel: Model<Prompts>,
  event: EVENT_PROMPT_ENUM | string,
  bonChance = 100,
  chatDto: ChatDto, // TODO form inside?
) => {
  let response: ReplyDto;
  let isLazyPrompt = false;
  // TODO from prompt table on scenario?

  // TODO on random generate

  const isLazyChance = bonChance < 100;

  if (isLazyChance) {
    bonChance = 100 - bonChance;
    const chance = random(0, 100);
    isLazyPrompt = chance < bonChance;
  }

  try {
    if (isLazyPrompt) {
      const lazyPrompt = await getPrompt(promptModel, event);
      return ReplyDto.fromPrompt(lazyPrompt);
    }

    const eventPrompt = await getPrompt(promptModel, event);
    if (eventPrompt) {
      return ReplyDto.fromPrompt(eventPrompt);
    }
  } catch (error) {
    // TODO error with db get from local
  }

  try {
    response = await amqpConnection.request<ReplyDto>({
      exchange: chatQueue.name,
      routingKey: 'v3', // TODO engine
      payload: chatDto, // TODO form inside?
      timeout: 60 * 1000,
    });
  } catch (error) {
    // TODO onEngineError
    // TODO from mongo lazy | ignore | error?
  }

  return response;
};

export const saySmth = async (
  amqpConnection: AmqpConnection,
  promptModel: Model<Prompts>,
  chatDto: ChatDto, // TODO form inside?
) => {
  let response;
  try {
    response = await amqpConnection.request<ReplyDto>({
      exchange: chatQueue.name,
      routingKey: 'v3', // TODO engine
      payload: chatDto, // TODO form inside?
      timeout: 60 * 1000,
    });
  } catch (error) {
    // TODO I am ignorance!
    response = await getPrompt(promptModel, EVENT_PROMPT_ENUM.IGNORE);
    // TODO set ignore flag
  }

  return response;
};
