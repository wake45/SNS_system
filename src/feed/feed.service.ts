import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Feed, FeedDocument } from './schemas/feed.schema';
import { AddCommentDto } from './dto/add-comment.dto';

@Injectable()
export class FeedService {
  constructor(@InjectModel(Feed.name) private feedModel: Model<FeedDocument>) {}

  async createFeed(authorId: string, content: string, imageUrl: string | null): Promise<Feed> {
    const newFeed = new this.feedModel({
      author_id: authorId,
      content,
      image_url: imageUrl,
      created_at: new Date(),
    });
    return newFeed.save();
  }

  async findAll(): Promise<Feed[]> {
    return this.feedModel.find().exec();
  }

  async addComment(feedId: string, addCommentDto: AddCommentDto, commenterId: string): Promise<Feed | null> {
    return this.feedModel.findByIdAndUpdate(
      feedId,
      {
        $push: {
          comments: {
            commenter_id: new Types.ObjectId(commenterId),
            comment: addCommentDto.comment,
            commented_at: new Date(),
          },
        },
      },
      { new: true },
    ).exec();
  }

  async likeFeed(feedId: string, userId: string): Promise<Feed | null> {
    return this.feedModel.findByIdAndUpdate(
      feedId,
      { $addToSet: { likes: new Types.ObjectId(userId) } },
      { new: true },
    ).exec();
  }
}
