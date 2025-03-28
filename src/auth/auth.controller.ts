import { Controller, Post, Body, UseGuards, Request, UnauthorizedException } from '@nestjs/common';
import { AuthService } from './auth.service';
import { UserDTO } from './dto/user.dto';
import { AuthGuard } from '@nestjs/passport';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('register')
  async register(@Body() userDto: UserDTO) {
    console.log(userDto.email);
    return this.authService.createUser(userDto);
  }

  @Post('login')
  async login(@Body() userDto: UserDTO) {
    console.log(userDto.email);
    return this.authService.validateUser(userDto);
  }

  @UseGuards(AuthGuard('jwt'))
  @Post('profile')
  getProfile(@Request() req) {
    return req.user;
  }
}
