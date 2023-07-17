import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { GENDER_ENUM, IDENTITY_TYPE_ENUM } from '@cmnw/core';

@Schema({ timestamps: true })
export class Identity extends Document {
  @Prop({ type: String })
  codename: string;

  @Prop({ type: String, ref: 'Users' })
  userId: string;

  @Prop({ type: Types.ObjectId, ref: 'Keys' })
  keyId: Types.ObjectId;

  @Prop({ type: String })
  username: string;

  @Prop({ type: String })
  profileDescription: string;

  @Prop({ type: String })
  status: string;

  @Prop({ type: Number })
  temperature?: number;

  @Prop({ type: String })
  version?: string;

  @Prop({ type: String, enum: GENDER_ENUM })
  gender?: GENDER_ENUM;

  @Prop({ type: String, enum: IDENTITY_TYPE_ENUM })
  type?: IDENTITY_TYPE_ENUM;

  @Prop({ type: String })
  textPrompt: string;

  @Prop({ type: Buffer })
  avatar: Buffer;

  @Prop({ type: String })
  avatarUrl: string;

  @Prop({ type: [String] })
  tags: Types.Array<string>;

  @Prop({ type: Date })
  updatedAt: Date;

  @Prop({ type: Date })
  createdAt: Date;
}

export const IdentitySchema = SchemaFactory.createForClass(Identity);
