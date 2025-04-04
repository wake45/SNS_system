import { Expose, Transform, Type } from 'class-transformer';
import { Types } from 'mongoose';

export class CommentResponseDto {
  @Transform(({ value }) => value?.toString())
  @Expose()
  commenter_id: string;

  @Expose()
  commenter_name: string;

  @Expose()
  comment: string;

  @Expose()
  commented_at: Date;
}

export class FeedResponseDto {
  @Transform(({ obj }) => obj._id.toString())
  @Expose()
  id: string;

  @Transform(({ value }) => value?.toString())
  @Expose()
  author_id: string;

  @Expose()
  content: string;

  @Expose()
  image_url?: string;

  @Expose()
  created_at: Date;

  @Transform(({ value }) => Array.isArray(value) ? value.map((id: Types.ObjectId) => id.toString()) : [])
  @Expose()
  likes: string[];

  @Type(() => CommentResponseDto)
  @Expose()
  comments: CommentResponseDto[];
}
