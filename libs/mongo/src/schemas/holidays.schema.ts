import { Document } from 'mongoose';
import { Prop, Schema } from '@nestjs/mongoose';

@Schema({ timestamps: true })
export class HolidaysSchema extends Document {
  @Prop({ type: String, ref: 'Guilds' })
  guildId: string;

  @Prop({ type: String })
  event: string;

  @Prop({ type: String })
  text: string;

  @Prop({ type: Number })
  position: number;
}
