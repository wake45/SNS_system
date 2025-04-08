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
  @Render('home') // ✅ HTML 템플릿
  getHomePage() {
    return {}; // 아무 데이터 안 보내도 됨
  }

  @UseGuards(AuthGuard('jwt'))
  @Get('feeds')
  async getFeedData(@Req() req: Request) {
    const user = req.user as UserDocument;
    const feeds = await this.homeService.getFollowingFeeds(user._id.toString());
    
    return {
      userEmail: user.email,
      feeds: feeds,
    };
  }

  @UseGuards(AuthGuard('jwt'))
  @Get('mypage')
  @Render('mypage')
  async renderMyPage(@Req() req: Request, @Res() res: Response) {
    const user = req.user as UserDocument;

    const userFind = await this.userService.validateOtherUser(user.email);
    if (!userFind) {
      return res.status(404).send('사용자를 찾을 수 없습니다.');
    }

    return {
      user: userFind,
      followingJson: JSON.stringify(userFind.toObject().following || []),
      followersJson: JSON.stringify(userFind.toObject().followers || []),
      isMyPage: true
    };
  }

  @UseGuards(AuthGuard('jwt'))
  @Get('profile')
  @Render('mypage')
  async renderUserProfile(@Query('email') email: string, @Req() req: Request, @Res() res) {
    const user = req.user as UserDocument;

    if (email === user.email) {
      return this.renderMyPage(req, res);
    }

    if (!email) {
      return res.status(400).send('이메일이 제공되지 않았습니다.');
    }
    
    

    const userFind = await this.userService.validateOtherUser(email);
    if (!userFind) {
      return res.status(404).send('사용자를 찾을 수 없습니다.');
    }

    return {
      user: userFind,
      followingJson: JSON.stringify(userFind.following || []),
      followersJson: JSON.stringify(userFind.followers || []),
      isMyPage: false
    };
  }
  
}
