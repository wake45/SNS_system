import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User, UserDocument } from './schemas/user.schema';
import { CreateUserDto } from './dto/create-user.dto';

@Injectable()
export class UserService {
  constructor(@InjectModel(User.name) private userModel: Model<UserDocument>) {}

  async create(createUserDto: CreateUserDto): Promise<User> {
    const createdUser = new this.userModel(createUserDto);
    return createdUser.save();
  }

  async findOneByEmail(email: string): Promise<UserDocument | null> {
    return this.userModel
    .findOne({ email })
    .populate('followers')
    .populate('following')
    .exec();
  }

  async updateProfilePicture(userId: string, imageUrl: string): Promise<User | null> {
    return this.userModel.findByIdAndUpdate(
        userId,
        { 'profile.profile_picture': imageUrl },
        { new: true }
    );
  }
    
  // 사용자 ID 배열로 사용자 정보 조회
  async getUsersByIds(userIds: string[]): Promise<User[]> {
    return this.userModel.find({ _id: { $in: userIds } }).select('username').exec();
  }
}
