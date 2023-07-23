import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

@Schema({ timestamps: true })
export class Guilds extends Document {
  @Prop({ required: true, type: String })
  _id: string;

  @Prop({ type: String })
  name: string;

  @Prop({ type: String })
  icon?: string;

  @Prop({ type: String, ref: 'Users' })
  ownerId?: string;

  @Prop({ type: String })
  emoji: string;

  @Prop({ type: Number })
  membersNumber?: number;

  @Prop({ type: [String] })
  tags: Types.Array<string>;

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

export const GuildsSchema = SchemaFactory.createForClass(Guilds);
