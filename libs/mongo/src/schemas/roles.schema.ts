import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ timestamps: true })
export class Roles extends Document {
  @Prop({ type: String, required: true })
  _id: string;

  @Prop({ type: String })
  name: string;

  @Prop({ type: String })
  description: string;

  @Prop({ type: String, ref: 'Guilds' })
  guildId: string;

  @Prop({ type: Number })
  bitfield: string;

  @Prop({ type: Boolean })
  isMentionable: boolean;

  @Prop({ type: Number })
  position: number;

  @Prop({ type: String, ref: 'Users' })
  scannedBy: string;

  @Prop({ type: String, ref: 'Users' })
  updatedBy: string;

  @Prop({ type: Date })
  updatedAt: Date;

  @Prop({ type: Date })
  createdAt: Date;
}

export const RolesSchema = SchemaFactory.createForClass(Roles);
