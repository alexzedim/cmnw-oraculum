import { MessageDto } from '@cmnw/core/dto';
import { IAgent, IChatFlow } from '@cmnw/core/types';
import { isArrayPropertyGuard } from '@cmnw/core/guards';
import { Prompts } from '@cmnw/mongo';

export class ChatFlowDto {
  baselinePrompt: Prompts;

  agent: IAgent;

  chatFlow: Array<IChatFlow>;

  static fromMessages(
    messages: Array<MessageDto>,
    prompt: Prompts,
    selfId: string,
  ): ChatFlowDto {
    const chatDto = new ChatFlowDto();
    chatDto.baselinePrompt = prompt;
    chatDto.agent.agentId = selfId;
    chatDto.agent.vectorId = messages.at(0).guildId;
    chatDto.chatFlow = messages.map((message) => ({
      role: message.userId === selfId ? 'assistant' : 'user',
      name: message.userId === selfId ? undefined : message.username,
      content: isArrayPropertyGuard(message.attachments)
        ? `${message.text} ${message.attachments.map((a) => a.url).join('\n')}`
        : message.text,
    }));

    return chatDto;
  }

  static fromPrompts(prompts: Array<Prompts>): ChatFlowDto {
    const dto = new ChatFlowDto();

    const sortedPrompts = prompts.sort((a, b) => a.position - b.position);
    const [promptModel] = sortedPrompts;

    dto.baselinePrompt = promptModel;
    dto.chatFlow = sortedPrompts.map((prompt) => ({
      role: prompt.role,
      content: prompt.text,
    }));

    return dto;
  }
}
