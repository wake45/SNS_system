import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Feed, FeedDocument } from 'src/feed/schemas/feed.schema';
import { User, UserDocument } from 'src/user/schemas/user.schema';

@Injectable()
export class HomeService {
  constructor(
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    @InjectModel(Feed.name) private feedModel: Model<FeedDocument>,
  ) {}

  async getFollowingFeeds(userId: string) {
    const user = await this.userModel.findById(userId).lean();
    
    const followingIds = [];
    if (user !== null && user.following) {
        const followingIds = user.following || [];
    }
    
    const feeds = await this.feedModel.find({
      author_id: { $in: followingIds },
    })
    .sort({ created_at: -1 })
    .limit(50)
    .lean();

    return feeds;
  }
}
