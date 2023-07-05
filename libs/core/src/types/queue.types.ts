import { Channel, Guild, MessageReference, User } from 'discord.js';

export interface MessageChatPublish {
  id: string;
  channel: Channel;
  guild: Guild;
  content: string;
  author: User;
  reference: MessageReference;
  model?: string;
  length?: number;
  token?: string;
  scannedBy?: string;
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

export interface MessageVoicePublish {
  readonly channel: Channel;
  readonly guild: Guild;
  readonly voice: Partial<YandexTTS> & Pick<YandexTTS, 'text'>;
}

export interface YandexTTS {
  text: string;
  lang: string;
  voice: string;
  speed: number;
}
