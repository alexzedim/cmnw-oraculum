import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

@Schema({ timestamps: true })
export class Channels extends Document {
  @Prop({ required: true, type: String })
  _id: string;

  @Prop({ type: String })
  name: string;

  @Prop({ type: String, ref: 'Guilds' })
  guildId: string;

  @Prop({ type: String, ref: 'Channels' })
  parentId?: string;

  @Prop({ type: String })
  type?: string;

  @Prop({ type: Number })
  position: number;

  @Prop({ type: [String] })
  tags: Types.Array<string>;

  @Prop({ type: Boolean, default: false })
  isDeleted: boolean;

  @Prop({ type: String, ref: 'Users' })
  scannedBy?: string;

  @Prop({ type: String, ref: 'Users' })
  updatedBy?: string;

  @Prop({ type: Date })
  scannedAt?: Date;

  @Prop({ type: Date })
  updatedAt: Date;

  @Prop({ type: Date })
  createdAt: Date;
}

export const ChannelsSchema = SchemaFactory.createForClass(Channels);
