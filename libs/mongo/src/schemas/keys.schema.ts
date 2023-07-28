import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { STATUS_ENUM } from '@cmnw/core';

@Schema({ timestamps: true })
export class Keys extends Document {
  @Prop({ type: String, refs: 'Users' })
  userId: string;

  @Prop({ type: String })
  name: string;

  @Prop({ type: String })
  password: string;

  @Prop({ type: String })
  email: string;

  @Prop({ type: String })
  emailPassword: string;

  @Prop({ type: String })
  token: string;

  @Prop({ type: [String], refs: 'Guilds' })
  vectors: Types.Array<string>;

  @Prop({ type: [String] })
  tags: Types.Array<string>;

  @Prop({
    default: STATUS_ENUM.FREE,
    type: String,
    enum: STATUS_ENUM,
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
KeysSchema.index(
  {
    tags: 'text',
    login: 'text',
    email: 'text',
    status: 'text',
  },
  {
    default_language: 'english',
    weights: {
      login: 1,
      email: 1,
      status: 2,
      tags: 3,
    },
    name: 'loadKey',
  },
);
