import { MessageDto } from '@cmnw/core/dto';
import { IAgent, IChatMessages } from '@cmnw/core/types';
import { isArrayPropertyGuard } from '@cmnw/core/guards';
import { Prompts } from '@cmnw/mongo';

export class ChatDto {
  baselinePrompt: Prompts;

  agent: IAgent;

  chatMessages: Array<IChatMessages>;

  static fromMessages(
    messages: Array<MessageDto>,
    prompt: Prompts,
    selfId: string,
  ): ChatDto {
    const chatDto = new ChatDto();
    chatDto.baselinePrompt = prompt;

    chatDto.agent.agentId = selfId;
    chatDto.agent.vectorId = messages.at(0).guildId;

    chatDto.chatMessages = messages.map((message) => ({
      role: message.userId === selfId ? 'assistant' : 'user',
      name: message.userId === selfId ? undefined : message.username,
      content: isArrayPropertyGuard(message.attachments)
        ? `${message.text} ${message.attachments.map((a) => a.url).join('\n')}`
        : message.text,
    }));

    return chatDto;
  }

  static fromPrompts(prompts: Array<Prompts>): ChatDto {
    const dto = new ChatDto();
    const [promptModel] = prompts;

    dto.baselinePrompt = promptModel;
    dto.chatMessages = prompts.map((prompt) => ({
      role: prompt.role,
      content: prompt.text,
    }));

    return dto;
  }
}
