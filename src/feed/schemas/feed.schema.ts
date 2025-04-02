import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type FeedDocument = Feed & Document;

@Schema()
export class Feed {
  @Prop({ type: Types.ObjectId, required: true })
  author_id: Types.ObjectId;

  @Prop({ required: true })
  content: string;

  @Prop()
  image_url?: string;

  @Prop({ default: Date.now })
  created_at: Date;

  @Prop({ type: [Types.ObjectId], default: [] })
  likes: Types.ObjectId[];

  @Prop({
    type: [
      {
        commenter_id: { type: Types.ObjectId, required: true },
        comment: { type: String, required: true },
        commented_at: { type: Date, default: Date.now },
      },
    ],
    default: [],
  })
  comments: {
    commenter_id: Types.ObjectId;
    comment: string;
    commented_at: Date;
  }[];
}

export const FeedSchema = SchemaFactory.createForClass(Feed);
