import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ timestamps: true })
export class Roles extends Document {
  @Prop({ type: Number, required: true })
  _id: string;

  @Prop({ type: String })
  name: string;

  @Prop({ type: String })
  description: string;

  @Prop({ type: Number, ref: 'Guilds' })
  guildId: string;

  @Prop({ type: Number })
  bitfield: string;

  @Prop({ type: Boolean })
  isMentionable: boolean;

  @Prop({ type: Number })
  position: number;

  @Prop({ type: Number })
  scannedBy: string;

  @Prop({ type: Number })
  updatedBy: string;

  @Prop({ type: Date })
  updatedAt: Date;

  @Prop({ type: Date })
  createdAt: Date;
}

export const RolesSchema = SchemaFactory.createForClass(Roles);
