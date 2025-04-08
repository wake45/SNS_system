import { IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { Types } from 'mongoose';

export class SendMessageDto {
  @IsOptional()
  sender_id?: Types.ObjectId;

  @IsNotEmpty()
  @IsString()
  message: string;

  @IsOptional()
  sent_at?: Date = new Date();
}