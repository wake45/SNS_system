import { BadRequestException, Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User, UserDocument } from './schemas/user.schema';
import { CreateUserDto } from './dto/create-user.dto';
import { UserResponseDto } from './dto/user-response.dto';

@Injectable()
export class UserService {
  constructor(@InjectModel(User.name) private userModel: Model<UserDocument>) {}

  async create(createUserDto: CreateUserDto): Promise<User> {
    const createdUser = new this.userModel(createUserDto);
    return createdUser.save();
  }

 async validateOtherUser(email: string): Promise<UserDocument | null>{
    const userFind = await this.findOneByEmail(email) as UserDocument;
    
    if (!userFind) {
      throw new UnauthorizedException("계정이 존재하지 않습니다.");
    }
  
    await (await userFind.populate('following', 'email')).populate('followers', 'email');

    return userFind;
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

  async findUserById(id: string): Promise<UserDocument | null> {
    return this.userModel.findById(id).exec();
  }  

  async followUser(currentUserId: string, targetUserEmail: string): Promise<UserDocument> {
    const [currentUser, targetUser] = await Promise.all([
      this.userModel.findById(currentUserId),
      this.userModel.findOne({ email: targetUserEmail }),
    ]);
  
    if (!currentUser || !targetUser) {
      throw new NotFoundException('사용자를 찾을 수 없습니다.');
    }
  
    if (currentUser._id.toString() === targetUser._id.toString()) {
      throw new BadRequestException('자기 자신을 팔로우할 수 없습니다.');
    }
  
    const alreadyFollowing = currentUser.following.some(
      id => id.toString() === targetUser._id.toString(),
    );
  
    if (!alreadyFollowing) {
      currentUser.following.push(targetUser._id);
      targetUser.followers.push(currentUser._id);
  
      await Promise.all([currentUser.save(), targetUser.save()]);
    } else {
      throw new BadRequestException('이미 팔로우한 사용자입니다.');
    }

    return currentUser;
  }
}
