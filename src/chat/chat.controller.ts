import { Controller, Get, Post, Body, Param, UseGuards, Req, NotFoundException, Res } from '@nestjs/common';
import { ChatService } from './chat.service';
import { SendMessageDto } from './dto/send-message.dto';
import { Types } from 'mongoose';
import { JwtAuthGuard } from 'src/user/jwt-auth.guard';
import { UserDocument } from 'src/user/schemas/user.schema';
import { Request, Response } from 'express';
import { ChatResponseDto } from './dto/response-chat.dto';
import { UserService } from 'src/user/user.service';

@Controller('chats')
export class ChatController {
  constructor(
    private readonly chatService: ChatService,
    private readonly userService: UserService,
  ) {}

  @UseGuards(JwtAuthGuard)
  @Post('initiate')
  async initiateChat(
    @Req() req: Request,
    @Body('userEmail') userEmail: string,
  ): Promise<ChatResponseDto> {
    const user = req.user as UserDocument;
    const myId = user._id.toString();

    if(userEmail === user.email){
      
    }

    const chat = await this.chatService.findOrCreateChatByEmail(myId, userEmail);
    return new ChatResponseDto(chat);
  }

  @UseGuards(JwtAuthGuard)
  @Get(':chatId')
  async getChat(
    @Param('chatId') chatId: string,
    @Req() req: Request,
    @Res() res: Response
  ) {
    const user = req.user as UserDocument;
  
    const message = await this.chatService.getMessages(new Types.ObjectId(chatId));
    const chat = await this.chatService.findChatById(chatId);

    if (!message) {
      throw new NotFoundException('채팅을 찾을 수 없습니다.');
    }
  
    const partnerId = chat.participants
      .map(participant => participant._id.toString())
      .find(id => id !== user._id.toString());
  
    if (!partnerId) {
      throw new NotFoundException('상대방 정보를 찾을 수 없습니다.');
    }
  
    const partner = await this.userService.findUserById(partnerId);
  
    if (!partner) {
      throw new NotFoundException('상대방 정보를 찾을 수 없습니다.');
    }

    const messages = chat.messages.map(message => ({
      sender_id: message.sender_id.toString(),
      message: message.message,
      sent_at: message.sent_at,
      isSent: message.sender_id.toString() === user._id.toString(),
    }));

    res.render('chat', {
      chatId: JSON.stringify(chat._id.toString() || []),
      messages: messages,
      partner: partner,
    });
  }
  

  /*
  @UseGuards(JwtAuthGuard)
  @Post(':user1/:user2')
  async getOrCreateChat(
    @Param('user1') user1: string,
    @Param('user2') user2: string,
    @Req() req: Request,
  ) {
    const user = req.user as UserDocument;

    const chat = await this.chatService.findOrCreateChat(
      new Types.ObjectId(user1),
      new Types.ObjectId(user2),
    );
    return chat;
  }
*/

  @UseGuards(JwtAuthGuard)
  @Post(':chatId/messages')
  async sendMessage(
    @Param('chatId') chatId: string,
    @Body() sendMessageDto: SendMessageDto,
    @Req() req: Request,
  ) {
    const user = req.user as UserDocument;

    // sender_id와 sent_at 값을 설정
    sendMessageDto.sender_id = user._id;
    sendMessageDto.sent_at = new Date();

    const newMessage  = await this.chatService.addMessage(new Types.ObjectId(chatId), sendMessageDto);
    return newMessage;
  }
}
