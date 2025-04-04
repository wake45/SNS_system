import { Controller, Post, Body, Res, UnauthorizedException, HttpStatus, HttpException, Session } from '@nestjs/common';
import { AuthService } from './auth.service';
import { CreateUserDto } from './dto/create-user.dto';
import { Response } from 'express';
import { JwtService } from '@nestjs/jwt';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService, private jwtService: JwtService) {}

  @Post('register')
  async register(@Body() createUserDto: CreateUserDto, @Res() res: Response) {
    try {
      await this.authService.createUser(createUserDto);
      res.redirect('/login.html'); // 회원가입 후 로그인 페이지로 리디렉션
    } catch (error) {
      throw new HttpException({
        status: HttpStatus.BAD_REQUEST,
        error: error.message,
      }, HttpStatus.BAD_REQUEST);
    }
  }

  @Post('login')
  async login(@Body() createUserDto: CreateUserDto, @Res() res: Response, @Session() session: Record<string, any>) {
    const result = await this.authService.validateUser(createUserDto);

    if (result?.accessToken && result?.user) {
      const payload = { sub: result.user._id.toString(), email: result.user.email };
      const accessToken = this.jwtService.sign(payload);
      res.cookie('access_token', result.accessToken, { httpOnly: true });

      // 현재 로그인한 사용자가 본인인지 확인
      const isMyPage = result.user._id.toString() === result.user._id.toString();

      return res.render('mypage', {
        user: result.user,
        isMyPage: isMyPage,
      });
    }
    
    throw new UnauthorizedException('로그인 실패');
  }

  @Post('logout')
  logout(@Res() res: Response) {
    res.clearCookie('access_token', { httpOnly: true });
    res.redirect('/login.html');
  }
}
