import { Document, Types } from 'mongoose';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

@Schema({ timestamps: true })
export class Users extends Document {
  @Prop({ required: true, type: Number })
  _id: string;

  @Prop({ type: String })
  name: string;

  @Prop({ type: String })
  username: string;

  @Prop({ type: String })
  cryptonym?: string;

  @Prop({ type: Boolean })
  isCoreUser: boolean;

  @Prop({ type: String })
  avatar: string;

  @Prop({ type: String })
  battleTag: string;

  @Prop({ type: [String] })
  tags: Types.Array<string>;

  @Prop({ type: Number })
  scannedBy?: string;

  @Prop({ type: Number })
  updatedBy?: string;

  @Prop({ type: Number, ref: 'Guild' })
  scannedFrom?: string;

  @Prop({ type: Number, ref: 'Guild' })
  updatedFrom?: string;

  @Prop({ type: Date })
  scannedAt?: Date;

  @Prop({ type: Date })
  updatedAt: Date;

  @Prop({ type: Date })
  createdAt: Date;
}

export const UsersSchema = SchemaFactory.createForClass(Users);
