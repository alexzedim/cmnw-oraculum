import { STATUS_ENUM } from '@cmnw/core';

export type KeyStatus = Array<STATUS_ENUM>;

export type Memorials = Array<Memorial>;

export type ClassHall = Partial<IClassHall>;

export type Role = 'user' | 'system' | 'assistant';

export interface ChatDialogFlow {
  role: Role;
  content: string;
  name?: string;
}

export interface IClassHall {
  emoji: string;
  tags: string[];
}

export interface Memorial {
  name: string;
  value: string;
}

export interface IAgent {
  agentId: string;
  vectorId: string;
}

export interface IChatMessages {
  role: 'user' | 'assistant' | 'system';
  name?: string;
  content: string;
}

export interface IAttachmentsMessage {
  _id: string;
  name: string;
  contentType: string;
  attachment: string;
  url: string;
}

export interface IMentionsMessage {
  _id: string;
  bot: boolean;
  username: string;
  avatar: string;
}
