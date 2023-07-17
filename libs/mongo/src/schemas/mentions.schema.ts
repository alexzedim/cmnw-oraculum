import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

@Schema()
export class Mentions {
  @Prop({ required: true, type: String })
  _id: string;

  @Prop({ type: Boolean })
  bot: boolean;

  @Prop({ type: String })
  username: string;

  @Prop({ type: String })
  avatar: string;
}

export const MentionsSchema = SchemaFactory.createForClass(Mentions);
