import { Module } from '@nestjs/common';
import { HomeController } from './home.controller';
import { HomeService } from './home.service';
import { MongooseModule } from '@nestjs/mongoose';
import { User, UserSchema } from 'src/user/schemas/user.schema';
import { Feed, FeedSchema } from 'src/feed/schemas/feed.schema';
import { UserService } from 'src/user/user.service';

@Module({
  imports:[
    MongooseModule.forFeature([{ name: User.name, schema: UserSchema }, { name: Feed.name, schema: FeedSchema }]),
  ],
  controllers: [HomeController],
  providers: [HomeService, UserService]
})
export class HomeModule {}
