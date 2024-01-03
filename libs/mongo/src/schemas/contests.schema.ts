import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

@Schema({ timestamps: true })
export class Contests extends Document {
  @Prop({ type: String, ref: 'Guilds' })
  guildId: string;

  @Prop({ type: String, ref: 'Roles' })
  roleId: string;

  @Prop({ type: String, ref: 'Channels' })
  channelId: string;

  @Prop({ type: String })
  trophy: string;

  @Prop({ type: String, ref: 'Users' })
  gameKeeperId: string;

  @Prop({ type: String, ref: 'Users' })
  winnerUserId: string;

  @Prop({ type: [String], ref: 'Users' })
  winnerHistory: Types.Array<string>;

  @Prop({ type: String })
  blockId: string;

  @Prop({ type: Types.ObjectId, ref: 'Prompts' })
  promptId: Types.ObjectId;

  @Prop({ type: Number })
  promptNextPositionCursor: number;

  @Prop({ type: [Types.ObjectId], ref: 'Prompts' })
  promptsHistory: Types.Array<Types.ObjectId>; // TODO full flow?

  @Prop({ type: Date })
  winnerAt: Date;

  @Prop({ type: Date })
  updatedAt: Date;

  @Prop({ type: Date })
  createdAt: Date;
}

export const ContestsSchema = SchemaFactory.createForClass(Contests);
ContestsSchema.index({ guildId: -1, roleId: -1 }, { name: 'IdxUniqueContest', unique: true });
