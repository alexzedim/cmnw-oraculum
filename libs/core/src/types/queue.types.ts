import { Channel, Guild, MessageReference } from 'discord.js';

export interface ChatMessageAuthor {
  userId: string;
  username: string;
}

export interface ChatMessageGuild {
  guildId: string;
  guildName: string;
}

export interface ChatMessageChannel {
  channelId: string;
  channelName: string;
  channelType: number | string;
}

export interface ChatMessageContent {
  text: string;
  length: number;
}

export interface ChatMessage {
  id: string;
  channel: ChatMessageChannel;
  guild: ChatMessageGuild;
  content: ChatMessageContent;
  author: ChatMessageAuthor;
  reference: MessageReference;
  sourceName: string;
  sourceId: string;
}

export interface QuestionChatPublish {
  id: string;
  userId?: string;
  username?: string;
  channelId: string;
  question: string;
  questionMarks: number;
  isCertain?: boolean;
  isAnswered?: boolean;
  createdAt?: Date;
  updateAt?: Date;
  personality: Array<string>;
}

export interface VoiceMessage {
  readonly channel: Channel;
  readonly guild: Guild;
  readonly voice: Partial<Voice> & Pick<Voice, 'text'>;
}

export interface Voice {
  text: string;
  lang: string;
  voice: string;
  speed: number;
}
