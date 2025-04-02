import { Controller, Get, Post, Body, Param, UseGuards, Req, UseInterceptors, UploadedFile, Res } from '@nestjs/common';
import { FeedService } from './feed.service';
import { CreateFeedDto } from './dto/create-feed.dto';
import { AddCommentDto } from './dto/add-comment.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { Request, Response } from 'express';
import { JwtAuthGuard } from 'src/user/jwt-auth.guard';
import { User, UserDocument } from 'src/user/schemas/user.schema';

@Controller('feed')
export class FeedController {
  constructor(private readonly feedService: FeedService) {}

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
    const user = req.user as UserDocument;
    console.log(`${user} 피드 생성!`);

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

  @Get()
  async findAll() {
    return this.feedService.findAll();
  }

  @UseGuards(JwtAuthGuard)
  @Post(':id/comments')
  async addComment(@Param('id') id: string, @Req() req, @Body() addCommentDto: AddCommentDto) {
    const commenterId = req.user.userId;
    return this.feedService.addComment(id, addCommentDto, commenterId);
  }

  @UseGuards(JwtAuthGuard)
  @Post(':id/like')
  async likeFeed(@Param('id') id: string, @Req() req) {
    const userId = req.user.userId;
    return this.feedService.likeFeed(id, userId);
  }
}
