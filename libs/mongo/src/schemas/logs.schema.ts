import { Document } from 'mongoose';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

@Schema({ timestamps: true })
export class Logs extends Document {
  @Prop({ type: String })
  event: string;

  @Prop({ type: Date })
  updatedAt: Date;

  @Prop({ type: Date })
  createdAt: Date;
}

export const LogsSchema = SchemaFactory.createForClass(Logs);
