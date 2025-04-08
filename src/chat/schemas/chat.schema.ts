import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

export type ChatDocument = HydratedDocument<Chat>;

@Schema()
export class Message {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  sender_id: Types.ObjectId;

  @Prop({ required: true })
  message: string;

  @Prop({ default: () => Date.now() })
  sent_at: Date;
}

export const MessageSchema = SchemaFactory.createForClass(Message);

@Schema()
export class Chat {
  @Prop({ type: [{ type: Types.ObjectId, ref: 'User' }], required: true })
  participants: Types.ObjectId[];

  @Prop({ type: [MessageSchema], default: [] })
  messages: Message[];
}

export const ChatSchema = SchemaFactory.createForClass(Chat);
