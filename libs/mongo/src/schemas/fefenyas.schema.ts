import { Document } from 'mongoose';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

@Schema({ timestamps: true })
export class Fefenya extends Document {
  @Prop({ required: true, type: String })
  _id: string;

  @Prop({ type: String })
  username: string;

  @Prop({ type: String, ref: 'Guilds' })
  guildId: string;

  @Prop({ type: Boolean })
  isGotd: boolean;

  @Prop({ type: Number })
  count: number;

  @Prop({ type: String })
  status: string;

  @Prop({ type: Date })
  updatedAt: Date;

  @Prop({ type: Date })
  createdAt: Date;
}

export const FefenyasSchema = SchemaFactory.createForClass(Fefenya);
