import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Types, Document } from 'mongoose';

@Schema()
export class Messages extends Document {
  @Prop({ required: true, type: Number })
  _id: string;

  @Prop({ type: Number, ref: 'Users' })
  userId: string;

  @Prop({ type: String })
  username: string;

  @Prop({ type: Number, ref: 'Guilds' })
  guildId: string;

  @Prop({ type: String })
  guildName: string;

  @Prop({ type: Number, ref: 'Channels' })
  channelId: string;

  @Prop({ type: String })
  channelName: string;

  @Prop({ type: Number })
  channelType: number;

  @Prop({ type: Number })
  referenceMessageId: string;

  @Prop({ type: Number })
  referenceChannelId: string;

  @Prop({ type: Number })
  referenceGuildId: string;

  @Prop({ type: String })
  text: string;

  @Prop({ type: Number })
  length: number;

  @Prop({ type: [String] })
  tags: Types.Array<string>;

  @Prop({ type: Number })
  scannedBy: string;

  @Prop({ type: Date })
  scannedAt: Date;

  @Prop({ type: Date })
  createdAt: Date;
}

export const MessagesSchema = SchemaFactory.createForClass(Messages);
MessagesSchema.index({ channelId: -1, createdAt: -1 }, { name: 'IdxChatThread' });
