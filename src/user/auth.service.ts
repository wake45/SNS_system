import { HttpException, HttpStatus, Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { User, UserDocument } from './schemas/user.schema';
import { CreateUserDto } from './dto/create-user.dto';
import { UserService } from './user.service';
import * as bcrypt from 'bcrypt';
import { ProfileDto, UserResponseDto } from './dto/user-response.dto';

@Injectable()
export class AuthService {
  constructor(
    private userService: UserService,
    private jwtService: JwtService,
  ) {}

  async createUser(createUserDto: CreateUserDto): Promise<User> {
    let userFind: UserDocument | null = await this.userService.findOneByEmail(createUserDto.email); //계정 검색
    if(userFind) {
        throw new HttpException('기가입된 이메일 입니다.', HttpStatus.BAD_REQUEST);
    }
    const registeredUser = await this.userService.create(createUserDto);
    if(!registeredUser){
      throw new HttpException('회원가입 오류!', HttpStatus.INTERNAL_SERVER_ERROR);
    }

    return registeredUser;
  }

  async validateUser(createUserDto: CreateUserDto): Promise<{ accessToken: string; user: UserResponseDto }> {
    const userFind = await this.userService.findOneByEmail(createUserDto.email) as UserDocument;
  
    if (!userFind) {
      throw new UnauthorizedException("계정이 존재하지 않습니다.");
    }
  
    await (await userFind.populate('following', 'email')).populate('followers', 'email');
  
    const validatePassword = await bcrypt.compare(createUserDto.password, userFind.password);
    if (!validatePassword) {
      throw new UnauthorizedException("패스워드가 일치하지 않습니다.");
    }
  
    const payload = { email: userFind.email, sub: userFind._id };
    const accessToken = this.jwtService.sign(payload);
  
    const { password, ...userWithoutPassword } = userFind.toObject();
    const userResponse = new UserResponseDto(
      userWithoutPassword.email,
      userWithoutPassword.username,
      new ProfileDto(userWithoutPassword.profile.name, userWithoutPassword.profile.bio, userWithoutPassword.profile.profile_picture),
      userWithoutPassword.followers,
      userWithoutPassword.following,
      userWithoutPassword._id,
    );
  
    return { accessToken, user: userResponse };
  }
}
