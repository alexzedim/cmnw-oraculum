import { Document } from 'mongoose';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

@Schema({ timestamps: true })
export class UsersFefenya extends Document {
  @Prop({ required: true, type: Number })
  _id: string;

  @Prop({ type: String })
  username: string;

  @Prop({ type: Number })
  guildId: string;

  @Prop({ type: Boolean })
  isGotd: boolean;

  @Prop({ type: Number })
  count: number;

  @Prop({ type: Date })
  updatedAt: Date;

  @Prop({ type: Date })
  createdAt: Date;
}

export const FefenyaUsersSchema = SchemaFactory.createForClass(UsersFefenya);
