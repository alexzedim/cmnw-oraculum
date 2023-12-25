import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { PROMPT_TYPE_ENUM, Role } from '@cmnw/core';

@Schema({ timestamps: true })
export class Prompts extends Document {
  @Prop({ type: Types.ObjectId, ref: 'Profiles' })
  profileId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Prompts' })
  previousPrompt?: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Prompts' })
  nextPrompt?: Types.ObjectId;

  @Prop({ type: String })
  name: string;

  @Prop({ type: String })
  model: string;

  @Prop({ type: String })
  event: string;

  @Prop({ type: String })
  role: Role;

  @Prop({ type: Number })
  version: number;

  @Prop({ type: Number })
  position: number;

  @Prop({ type: String, enum: PROMPT_TYPE_ENUM })
  type: PROMPT_TYPE_ENUM;

  @Prop({ type: Boolean })
  isGenerated: boolean;

  @Prop({ type: Number })
  temperature?: number;

  @Prop({ type: String })
  text: string;

  @Prop({ type: [String] })
  tags: Types.Array<string> | Array<string>;

  @Prop({ type: Date })
  updatedAt: Date;

  @Prop({ type: Date })
  createdAt: Date;
}

export const PromptsSchema = SchemaFactory.createForClass(Prompts);
