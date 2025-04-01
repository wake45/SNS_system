import { Controller, Post, Body, Res, UnauthorizedException, Get, HttpStatus, HttpException, Param, UseInterceptors, UploadedFile, NotFoundException } from '@nestjs/common';
import { UserService } from './user.service';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { join } from 'path';
import { Response } from 'express';
import * as fs from 'fs';
import { User } from './schemas/user.schema';

@Controller('user')
export class UserController {
    constructor(private userService: UserService) {}

    @Post('upload')
    @UseInterceptors(FileInterceptor('profileImage', {
        storage: diskStorage({
        destination: (req, file, cb) => {
            const uploadPath = join(__dirname, '..', '..', 'public', 'uploads');
            // 디렉토리가 존재하지 않으면 생성
            if (!fs.existsSync(uploadPath)) {
            fs.mkdirSync(uploadPath, { recursive: true });
            }
            cb(null, uploadPath);
        },
        filename: (req, file, cb) => {
            const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
            cb(null, uniqueSuffix + '-' + file.originalname);
        },
        }),
        fileFilter: (req, file, cb) => {
        if (!file.mimetype.match(/\/(jpg|jpeg|png|gif)$/)) {
            return cb(new Error('지원하지 않는 파일 형식입니다.'), false);
        }
        cb(null, true);
        },
        limits: {
        fileSize: 2 * 1024 * 1024, // 2MB
        },
    }))
    async uploadProfileImage(
        @UploadedFile() file: Express.Multer.File,
        @Body('userId') userId: string,
        @Res() res: Response
    ) {
        if (!file) {
        return res.status(400).json({ message: '파일이 업로드되지 않았습니다.' });
        }

        const imageUrl = `/public/uploads/${file.filename}`;

        try {
        await this.userService.updateProfilePicture(userId, imageUrl);
        return res.status(200).json({ imageUrl });
        } catch (error) {
        return res.status(500).json({ message: '프로필 이미지 업데이트에 실패했습니다.', error: error.message });
        }
    }

    @Post('get-usernames')
    async getUsernames(@Body('userIds') userIds: string[]): Promise<{ usernames: string[] }> {
        console.log('팔로우 목록 확인!');
        const users = await this.userService.getUsersByIds(userIds);
        const usernames = users.map(user => user.username);
        return { usernames };
    }
}