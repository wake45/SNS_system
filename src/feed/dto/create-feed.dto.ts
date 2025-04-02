import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateFeedDto {
  @IsNotEmpty()
  @IsString()
  content: string;

  @IsOptional()
  @IsString()
  image_url?: string;
}
