import { HttpException, HttpStatus, Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
//import { InjectModel } from '@nestjs/mongoose';
//import { Model } from 'mongoose';
import { User, UserDocument } from './schemas/user.schema';
import { UserDTO } from './dto/user.dto';
import { UserService } from './user.service';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  constructor(
    private userService: UserService,
    private jwtService: JwtService,
  ) {}

  async createUser(userDTO: UserDTO): Promise<User> {
    let userFind: User | null = await this.userService.findOneByEmail(userDTO.email); //계정 검색
    if(userFind) {
        throw new HttpException('User aleady used!', HttpStatus.BAD_REQUEST);
    }
    const registeredUser = await this.userService.create(userDTO);
    if(!registeredUser){
      throw new HttpException('Username register error!', HttpStatus.INTERNAL_SERVER_ERROR);
    }

    return registeredUser;
  }

  async validateUser(userDTO: UserDTO): Promise<{ accessToken: string }> {
    let userFind: User | null = await this.userService.findOneByEmail(userDTO.email); //계정 검색
    if(!userFind) {
      console.log("계정이 존재하지 않습니다.");
      throw new UnauthorizedException();
    }

    const validatePassword = await bcrypt.compare(userDTO.password, userFind.password); //비밀번호 검증
    if(!validatePassword) {
      console.log("패스워드가 일치하지 않습니다.");
      throw new UnauthorizedException();
    }

    const payload = { email: userFind.email, sub: userFind._id };
    const accessToken = this.jwtService.sign(payload);
    return { accessToken }; // 인가 토큰 발행
  }
}
