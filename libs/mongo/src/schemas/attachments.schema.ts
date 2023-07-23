import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

@Schema()
export class Attachments {
  @Prop({ required: true, type: String })
  _id: string;

  @Prop({ type: String })
  name: string;

  @Prop({ type: String })
  contentType: string;

  @Prop({ type: String })
  attachment: string;

  @Prop({ type: String })
  url: string;
}

export const AttachmentsSchema = SchemaFactory.createForClass(Attachments);
