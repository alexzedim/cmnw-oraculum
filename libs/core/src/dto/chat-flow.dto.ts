import { MessageDto } from '@cmnw/core/dto';

export class ChatFlowDto {
  role: 'user' | 'assistant';

  name?: string;

  content: string;

  static fromMessageDto(message: MessageDto, self: string): ChatFlowDto {
    const dto = new ChatFlowDto();
    dto.role = message.userId === self ? 'assistant' : 'user';
    dto.name = message.userId === self ? undefined : message.username;
    dto.content = message.text;
    return dto;
  }
}
