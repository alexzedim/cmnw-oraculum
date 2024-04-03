import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { EVENT_PROMPT_ENUM, Role } from '@cmnw/core';

@Schema({ timestamps: true })
export class Prompts extends Document {
  @Prop({ type: Types.ObjectId, ref: 'Profiles' })
  profileId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Prompts' })
  isGeneratedBy: Types.ObjectId;

  @Prop({ type: Boolean })
  isGenerated: boolean;

  @Prop({ type: Boolean })
  isBasePrompt: boolean;

  @Prop({ type: String })
  blockId: string;

  @Prop({ type: String })
  name: string;

  @Prop({ type: String })
  model: string;

  @Prop({ type: String })
  onEvent: string | EVENT_PROMPT_ENUM;

  @Prop({ type: String })
  role: Role;

  @Prop({ type: Number })
  position: number;

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
PromptsSchema.index(
  {
    onEvent: 'text',
    tags: 'text',
    name: 'text',
    text: 'text',
  },
  {
    default_language: 'english',
    weights: {
      onEvent: 10,
      tags: 5,
      name: 2,
      text: 1,
    },
    name: 'TEXT',
  },
);
