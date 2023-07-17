import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

@Schema({ timestamps: true })
export class Games {
  @Prop({ required: true, type: String })
  _id: string;

  @Prop({ required: true, type: String })
  username: string;

  @Prop({ type: String, ref: 'Guilds' })
  guildId: string;

  @Prop({ type: Number })
  score: number;

  @Prop({ type: Date })
  updatedAt: Date;

  @Prop({ type: Date })
  createdAt: Date;
}

export const GamesSchema = SchemaFactory.createForClass(Games);
GamesSchema.index(
  {
    name: 'text',
    tags: 'text',
  },
  {
    weights: {
      name: 1,
      tags: 1,
    },
    name: 'queens',
  },
);
