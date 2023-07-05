import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { PERMISSIONS_ENUM, SUBJECT_ENUM } from 'cmnw/core';

@Schema({ timestamps: true })
export class Permissions extends Document {
  @Prop({ type: Number })
  controlId: string;

  @Prop({ type: String, enum: SUBJECT_ENUM })
  controlType: SUBJECT_ENUM;

  @Prop({ type: String, enum: PERMISSIONS_ENUM })
  permission: PERMISSIONS_ENUM;

  @Prop({ type: Number })
  subjectId: string;

  @Prop({ type: String, enum: SUBJECT_ENUM })
  subjectType: SUBJECT_ENUM;

  @Prop({ type: Boolean, default: false })
  isDiscordNative: boolean;

  @Prop({ type: Boolean, default: true })
  isActive: boolean;

  @Prop({ type: Number })
  bitfield: string;

  @Prop({ type: Date })
  updatedAt: Date;

  @Prop({ type: Date })
  createdAt: Date;
}

export const PermissionsSchema = SchemaFactory.createForClass(Permissions);
