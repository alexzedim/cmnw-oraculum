import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ timestamps: true })
export class Channels extends Document {
  @Prop({ required: true, type: Number })
  _id: string;

  @Prop({ type: String })
  name: string;

  @Prop({ type: Number, ref: 'Guilds' })
  guildId: string;

  @Prop({ type: Number })
  parentId?: string;

  @Prop({ type: String })
  type?: string;

  @Prop({ type: Number })
  position: number;

  @Prop({ type: Boolean, default: false })
  isDeleted: boolean;

  @Prop({ type: Number })
  scannedBy?: string;

  @Prop({ type: Number })
  updatedBy?: string;

  @Prop({ type: Date })
  scannedAt?: Date;

  @Prop({ type: Date })
  updatedAt: Date;

  @Prop({ type: Date })
  createdAt: Date;
}

export const ChannelsSchema = SchemaFactory.createForClass(Channels);
