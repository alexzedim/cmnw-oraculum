import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { KEY_STATUS_ARRAY, STATUS_ENUM } from 'cmnw/core';

@Schema({ timestamps: true })
export class Keys extends Document {
  @Prop({ type: Number })
  id: string;

  @Prop({ type: String })
  name: string;

  @Prop({ type: String })
  login: string;

  @Prop({ type: String })
  email: string;

  @Prop({ type: String })
  password: string;

  @Prop({ type: String })
  token: string;

  @Prop({ type: [String] })
  tags: Types.Array<string>;

  @Prop({
    default: STATUS_ENUM.FREE,
    type: String,
    enum: KEY_STATUS_ARRAY,
  })
  status: STATUS_ENUM;

  @Prop({ type: [Number] })
  partials: number[];

  @Prop({ type: [Number] })
  intents: number[];

  @Prop({ type: Date })
  indexedAt: Date;

  @Prop({ type: Date })
  updatedAt: Date;

  @Prop({ type: Date })
  createdAt: Date;
}

export const KeysSchema = SchemaFactory.createForClass(Keys);
