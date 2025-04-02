import { IsNotEmpty, IsString } from 'class-validator';

export class AddCommentDto {
  @IsNotEmpty()
  @IsString()
  comment: string;
}