import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { GENDER_ENUM, Role } from '@cmnw/core';

@Schema()
export class Prompts extends Document {
  @Prop({ type: String })
  profileId: string;

  @Prop({ type: String, unique: true })
  codename: string;

  @Prop({ type: String })
  role: Role;

  @Prop({ type: Number })
  version: number;

  @Prop({ type: Number })
  position: number;

  @Prop({ type: Number })
  temperature?: number;

  @Prop({ type: String })
  text: string;

  @Prop({ type: String, enum: GENDER_ENUM })
  gender?: GENDER_ENUM;

  @Prop({ type: [String] })
  tags: Types.Array<string>;
}

export const PromptsSchema = SchemaFactory.createForClass(Prompts);
