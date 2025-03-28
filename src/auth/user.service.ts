import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User, UserDocument } from './schemas/user.schema';
import { UserDTO } from './dto/user.dto';

@Injectable()
export class UserService {
  constructor(@InjectModel(User.name) private userModel: Model<UserDocument>) {}

  async create(userDto: UserDTO): Promise<User> {
    const createdUser = new this.userModel(userDto);
    return createdUser.save();
  }

  async findOneByEmail(email: string): Promise<User | null> {
    return this.userModel.findOne({email}).exec();
  }
}
