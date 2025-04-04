import { Controller, Get, Post, Body, Param, UseGuards, Req, UseInterceptors, UploadedFile, Res, Delete, NotFoundException, ForbiddenException, Query } from '@nestjs/common';
import { FeedService } from './feed.service';
import { CreateFeedDto } from './dto/create-feed.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { Request, Response } from 'express';
import { JwtAuthGuard } from 'src/user/jwt-auth.guard';
import { User, UserDocument } from 'src/user/schemas/user.schema';
import { plainToInstance } from 'class-transformer';
import { CreateCommentDto } from './dto/create-comment.dto';
import { UserService } from 'src/user/user.service';
import { FeedResponseDto } from './dto/feed-response.dto';

@Controller('feed')
export class FeedController {
  constructor(private readonly feedService: FeedService, private readonly userService: UserService) {}

  @UseGuards(JwtAuthGuard)
  @Post()
  @UseInterceptors(FileInterceptor('image', {
    storage: diskStorage({
      destination: './public/uploads',
      filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
        cb(null, `${uniqueSuffix}${extname(file.originalname)}`);
      },
    }),
    fileFilter: (req, file, cb) => {
      if (!file.mimetype.match(/\/(jpg|jpeg|png|gif)$/)) {
        return cb(new Error('지원되지 않는 파일 형식입니다.'), false);
      }
      cb(null, true);
    },
  }))
  async create(
    @UploadedFile() file: Express.Multer.File,
    @Body() createFeedDto: CreateFeedDto,
    @Req() req: Request,
    @Res() res: Response
  ) {
    const user = req.user as UserDocument    

    if (!user) {
      return res.status(401).json({ message: '인증된 사용자가 아닙니다.' });
    }
  
    const imageUrl = file ? `/uploads/${file.filename}` : null;
  
    try { 
      await this.feedService.createFeed(user._id.toString(), createFeedDto.content, imageUrl);
      return res.status(201).json({ message: '피드가 성공적으로 생성되었습니다.' });
    } catch (error) {
      return res.status(500).json({ message: '피드 생성 중 오류가 발생했습니다.', error });
    }
  }

  @UseGuards(JwtAuthGuard)
  @Get('user')
  async getUserFeeds(@Req() req: Request, @Query('isMyPage') isMyPage: string, @Query('email') email: string): Promise<FeedResponseDto[]> {
    let FindId;

    if(isMyPage === 'true'){
      const user = req.user as UserDocument;
      FindId = user._id.toString();
    } else {
      let FindUser = await this.userService.findOneByEmail(email);
      if(FindUser !== null) FindId = FindUser._id.toString();
    }

    const feeds = await this.feedService.findFeedsByUserId(FindId);

    console.log(feeds);

    const plainFeeds = feeds.map(f => f.toObject());
    return plainToInstance(FeedResponseDto, plainFeeds, {
      excludeExtraneousValues: true,
    });
  }

  @UseGuards(JwtAuthGuard)
  @Post(':id/comment')
  async addComment(
    @Param('id') feedId: string,
    @Body() createCommentDto: CreateCommentDto,
    @Req() req,
  ) {
    const user = req.user as UserDocument;
    createCommentDto.commenter_name = user.profile.name;
    const newComment = await this.feedService.addComment(feedId, user._id.toString(), createCommentDto);
    return { success: true, commenter_name: req.user.username, comment: newComment };
  }

  @UseGuards(JwtAuthGuard)
  @Post(':id/like')
  async likeFeed(@Param('id') id: string, @Req() req: Request, @Res() res: Response) {
    const user = req.user as UserDocument;
    const userId = user._id.toString();
  
    console.log(id);
    const feed = await this.feedService.findFeedById(id);
    console.log(feed);
    if (!feed) {
      return res.status(404).json({ message: '피드를 찾을 수 없습니다.' });
    }
  
    if (feed.likes.includes(user._id)) {
      return res.status(400).json({ message: '이미 좋아요를 눌렀습니다.' });
    }
  
    await this.feedService.addLikeToFeed(id, userId);
    return res.status(200).json({ message: '좋아요가 추가되었습니다.' });
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  async deleteFeed(@Param('id') id: string, @Req() req) {
    const user = req.user as UserDocument;
    const feed = await this.feedService.findFeedById(id);

    if (!feed) {
      throw new NotFoundException('피드를 찾을 수 없습니다.');
    }

    if (feed.author_id.toString() !== user._id.toString()) {
      throw new ForbiddenException('이 피드를 삭제할 권한이 없습니다.');
    }

    await this.feedService.deleteFeed(id);
    return { message: '피드가 성공적으로 삭제되었습니다.' };
  }
}
