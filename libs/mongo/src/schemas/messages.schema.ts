import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Types, Document } from 'mongoose';
import {
  Attachments,
  AttachmentsSchema,
  Mentions,
  MentionsSchema,
} from '@cmnw/mongo/schemas';

@Schema()
export class Messages extends Document {
  @Prop({ required: true, type: String })
  _id: string;

  @Prop({ type: String, ref: 'Users' })
  userId: string;

  @Prop({ type: String })
  username: string;

  @Prop({ type: String, ref: 'Guilds' })
  guildId: string;

  @Prop({ type: String })
  guildName: string;

  @Prop({ type: String, ref: 'Channels' })
  channelId: string;

  @Prop({ type: String })
  channelName: string;

  @Prop({ type: Number })
  channelType: number;

  @Prop({ type: String, ref: 'Messages' })
  referenceMessageId: string;

  @Prop({ type: String, ref: 'Channels' })
  referenceChannelId: string;

  @Prop({ type: String, ref: 'Guilds' })
  referenceGuildId: string;

  @Prop({ type: String })
  text: string;

  @Prop({ type: Number })
  length: number;

  @Prop({ type: Number })
  emojisCount: number;

  @Prop({ type: [MentionsSchema], ref: 'Users' })
  mentions: Types.Array<Mentions>;

  @Prop({ type: [AttachmentsSchema] })
  attachments: Types.Array<Attachments>;

  @Prop({ type: [String] })
  tags: Types.Array<string>;

  @Prop({ type: String })
  scannedBy: string;

  @Prop({ type: Date })
  scannedAt: Date;

  @Prop({ type: Date })
  createdAt: Date;
}

export const MessagesSchema = SchemaFactory.createForClass(Messages);
MessagesSchema.index(
  { channelId: -1, createdAt: -1 },
  { name: 'IdxChatThread' },
);
