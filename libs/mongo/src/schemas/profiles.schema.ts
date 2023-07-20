import { Document, Types } from 'mongoose';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { GENDER_ENUM } from '@cmnw/core';

@Schema({ timestamps: true })
export class Profiles extends Document {
  @Prop({ type: String })
  codename: string;

  @Prop({ type: Types.ObjectId, ref: 'Keys' })
  keyId: Types.ObjectId;

  @Prop({ type: String, ref: 'Users' })
  userId: string;

  @Prop({ type: String })
  username: string;

  @Prop({ type: String })
  name: string;

  @Prop({ type: [String] })
  aliases: Types.Array<string>;

  @Prop({ type: Buffer })
  avatar: Buffer;

  @Prop({ type: String })
  avatarUrl: string;

  @Prop({ type: String, enum: GENDER_ENUM })
  gender?: GENDER_ENUM;

  @Prop({ type: String })
  description: string;

  @Prop({ type: String })
  status: string;

  @Prop({ type: [String] })
  tags: Types.Array<string>;

  @Prop({ type: Date })
  updatedAt: Date;

  @Prop({ type: Date })
  createdAt: Date;
}

export const ProfilesSchema = SchemaFactory.createForClass(Profiles);
ProfilesSchema.index(
  {
    username: 'text',
    name: 'text',
    codename: 'text',
  },
  {
    default_language: 'english',
    weights: {
      codename: 1,
      username: 2,
      name: 2,
    },
    name: 'getProfile',
  },
);
