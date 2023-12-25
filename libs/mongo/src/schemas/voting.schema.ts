import { Document, Types } from 'mongoose';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

@Schema({ timestamps: true })
export class Voting extends Document {
  @Prop({ type: String })
  initiatedBy: string;

  @Prop({ type: String })
  type: string;

  @Prop({ type: Number })
  quorumCutoff: number;

  @Prop({ type: [String] })
  voted: Types.Array<string>;

  @Prop({ type: [String] })
  votersPull: Types.Array<string>;

  @Prop({ type: String })
  status: string;

  @Prop({ type: Date })
  endDate: Date;

  @Prop({ type: Date })
  updatedAt: Date;

  @Prop({ type: Date })
  createdAt: Date;
}

export const VotingSchema = SchemaFactory.createForClass(Voting);
