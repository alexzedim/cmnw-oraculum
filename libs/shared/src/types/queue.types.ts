import { Channel, Guild, MessageReference, User } from 'discord.js';

export interface MessageChatPublish {
  readonly id: string;
  readonly channel: Channel;
  readonly guild: Guild;
  readonly content: string;
  readonly author: User;
  readonly reference: MessageReference;
  readonly prompt?: string;
  readonly length?: number;
  readonly token?: string;
  readonly scannedBy?: string;
}

export interface MessageJobResInterface {
  readonly response: string;
  readonly channelId: string;
}
