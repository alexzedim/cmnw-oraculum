import { Document, Types } from 'mongoose';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

@Schema({ timestamps: true })
export class Users extends Document {
  @Prop({ required: true, type: String })
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

  @Prop({ type: String, ref: 'Users' })
  scannedBy?: string;

  @Prop({ type: String, ref: 'Users' })
  updatedBy?: string;

  @Prop({ type: String, ref: 'Guilds' })
  scannedFrom?: string;

  @Prop({ type: String, ref: 'Guilds' })
  updatedFrom?: string;

  @Prop({ type: Date })
  scannedAt?: Date;

  @Prop({ type: Date })
  updatedAt: Date;

  @Prop({ type: Date })
  createdAt: Date;
}

export const UsersSchema = SchemaFactory.createForClass(Users);
