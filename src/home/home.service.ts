import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import mongoose, { Model } from 'mongoose';
import { Feed, FeedDocument } from 'src/feed/schemas/feed.schema';
import { User, UserDocument } from 'src/user/schemas/user.schema';

@Injectable()
export class HomeService {
  constructor(
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    @InjectModel(Feed.name) private feedModel: Model<FeedDocument>,
  ) {}

  async getFollowingFeeds(userId: string) {
    const user = await this.userModel.findById(userId);
    const mongoose = require('mongoose');
    
    let followingIds: mongoose.Types.ObjectId[] = [];
    if (user?.following && Array.isArray(user.following)) {
      followingIds = user.following.map(id => new mongoose.Types.ObjectId(id));
    }
    
    const feeds = await this.feedModel.find({
      author_id: { $in: followingIds.map(id => id.toString()) },
    })
    .sort({ created_at: -1 })
    .limit(50)
    .lean();

    return feeds;
  }
}
