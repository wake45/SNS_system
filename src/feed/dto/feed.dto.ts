import { Expose } from 'class-transformer';

export class FeedDto {
  @Expose()
  readonly id: string;

  @Expose()
  readonly content: string;

  @Expose()
  readonly image_url?: string;

  @Expose()
  readonly created_at: Date;

  @Expose()
  readonly likes: string[] = [];

  @Expose()
  readonly comments: string[] = [];
}
