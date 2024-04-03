import { Role } from '@cmnw/core';
import { Prompts } from '@cmnw/mongo';

export class ReplyDto {
  id: string;

  object?: string;

  createdAt: Date;

  model: string;

  role: Role;

  reply: string;

  static fromPrompt(prompt: Prompts) {
    const dto = new ReplyDto();

    Object.assign(dto, {
      id: prompt._id.toString(),
      role: prompt.role,
      createdAt: prompt.createdAt,
      model: prompt.model,
      reply: prompt.text,
    });

    return dto;
  }
}
