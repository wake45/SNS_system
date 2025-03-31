import { Controller, Post, Body, UseGuards, Request, UnauthorizedException, Res } from '@nestjs/common';
import { AuthService } from './auth.service';
import { CreateUserDto } from './dto/create-user.dto';
import { AuthGuard } from '@nestjs/passport';
import { Response } from 'express'; // 이거 추가!

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('register')
  async register(@Body() createUserDto: CreateUserDto) {
    console.log(createUserDto.email);
    return this.authService.createUser(createUserDto);
  }

  @Post('login')
  async login(@Body() createUserDto: CreateUserDto, @Res() res: Response) {
    console.log(createUserDto.email);
    const result = await this.authService.validateUser(createUserDto);
    console.log(result);

    if (result?.accessToken) {
      res.cookie('access_token', result.accessToken, { httpOnly: true });
      return res.render('mypage', { user: result.user });
    }
    
    throw new UnauthorizedException('로그인 실패');
  }

  @UseGuards(AuthGuard('jwt'))
  @Post('profile')
  getProfile(@Request() req) {
    return req.user;
  }
}
