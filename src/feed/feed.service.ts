import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import mongoose, { Model, Types } from 'mongoose';
import { Feed, FeedDocument } from './schemas/feed.schema';
import { CreateCommentDto } from './dto/create-comment.dto';

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

  async findFeedsByUserId(userId: string): Promise<Feed[]> {
    return this.feedModel.find({ author_id: userId }).sort({ created_at: -1 }).exec();
  }

  async addComment(feedId: string, userId: string, createCommentDto: CreateCommentDto) {
    const feed = await this.feedModel.findById(feedId);
    if (!feed) {
      throw new NotFoundException('피드를 찾을 수 없습니다.');
    }

    const commenterId = new mongoose.Types.ObjectId(userId);
    const newComment = {
      commenter_id: commenterId,
      comment: createCommentDto.comment,
      commented_at: new Date(),
    };

    feed.comments.push(newComment);
    await feed.save();

    return newComment;
  }

  async findFeedById(id: string): Promise<Feed | null> {
    return this.feedModel.findById(id).exec();
  }  

  async addLikeToFeed(feedId: string, userId: string): Promise<void> {
    await this.feedModel.findByIdAndUpdate(feedId, {
      $push: { likes: userId },
    }).exec();
  }

  async deleteFeed(id: string): Promise<void> {
    await this.feedModel.findByIdAndDelete(id).exec();
  }
}
