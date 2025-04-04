import { Controller, Get, Query, Render, Req, Res, UseGuards } from '@nestjs/common';
import { HomeService } from './home.service';
import { AuthGuard } from '@nestjs/passport';
import { UserDocument } from 'src/user/schemas/user.schema';
import { Request, Response } from 'express';
import { UserService } from 'src/user/user.service';

@Controller('home')
export class HomeController {
  constructor(private readonly homeService: HomeService, private userService: UserService) {}

  @UseGuards(AuthGuard('jwt'))
  @Get()
  @Render('home')
  async getHomePage(@Req() req: Request) {
    const user = req.user as UserDocument;
    const feeds = await this.homeService.getFollowingFeeds(user._id.toString());
    return { feeds }; // 'home.hbs'에서 feeds를 사용할 수 있게 됨
  }

  @UseGuards(AuthGuard('jwt'))
  @Get('mypage')
  @Render('mypage')
  renderMyPage(@Req() req: Request, @Res() res: Response) {
    const user = req.user as UserDocument;

    return { user: user, isMyPage: true };
  }

  @UseGuards(AuthGuard('jwt'))
  @Get('profile')
  @Render('mypage')
  async renderUserProfile(@Query('email') email: string, @Res() res) {
    if (!email) {
      return res.status(400).send('이메일이 제공되지 않았습니다.');
    }

    const user = await this.userService.findOneByEmail(email);
    if (!user) {
      return res.status(404).send('사용자를 찾을 수 없습니다.');
    }

    return { user: user, isMyPage: false };
  }
  
}
