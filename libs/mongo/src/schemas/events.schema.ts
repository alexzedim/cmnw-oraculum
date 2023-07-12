import { Document, SchemaTypes } from 'mongoose';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

@Schema()
export class Event extends Document {
  @Prop({ type: String, ref: 'Channels' })
  channelId: string;

  @Prop({ type: String, ref: 'Users' })
  userId: string;

  @Prop({ type: String, ref: 'Guilds' })
  guildId: string;

  @Prop({ type: String, ref: 'Messages' })
  messageId: string;

  @Prop({ type: String })
  nameValue: string;

  @Prop({ type: SchemaTypes.Mixed })
  oldValue: boolean | string | number;

  @Prop({ type: SchemaTypes.Mixed })
  newValue: string;

  @Prop({ type: String })
  event: string;

  @Prop({ type: Date })
  updatedAt: Date;

  @Prop({ type: Date })
  createdAt: Date;
}

export const EventsSchema = SchemaFactory.createForClass(Event);
