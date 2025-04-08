import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { SendMessageDto } from './dto/send-message.dto';
import { Chat, ChatDocument, Message } from './schemas/chat.schema';
import { User, UserDocument } from 'src/user/schemas/user.schema';

@Injectable()
export class ChatService {
  constructor(
    @InjectModel(Chat.name) private chatModel: Model<ChatDocument>,
    @InjectModel(User.name) private userModel: Model<UserDocument>,
  ) {}

  async findOrCreateChatByEmail(myId: string, partnerEmail: string): Promise<ChatDocument> {
    const partner = await this.userModel.findOne({ email: partnerEmail });
    if (!partner) {
      throw new NotFoundException('상대방 사용자를 찾을 수 없습니다.');
    }

    const existingChat = await this.chatModel.findOne({
      participants: { $all: [new Types.ObjectId(myId), partner._id] },
    });

    if (existingChat) {
      return existingChat;
    }

    const newChat = new this.chatModel({
      participants: [new Types.ObjectId(myId), partner._id],
      messages: [],
    });

    return newChat.save();
  }

  async findChatById(chatId: string): Promise<ChatDocument> {
    const chat = await this.chatModel.findById(chatId).exec();
    if (!chat) {
      throw new NotFoundException('상대방 사용자를 찾을 수 없습니다.');
    }
    return chat;
  }

  async getMessages(chatId: Types.ObjectId): Promise<Message[]> {
    const chat = await this.chatModel.findById(chatId);
    if (!chat) {
      throw new Error('Chat not found');
    }
    return chat.messages;
  }

  /*
  async findOrCreateChat(user1: Types.ObjectId, user2: Types.ObjectId): Promise<Chat> {
    let chat = await this.chatModel.findOne({
      participants: { $all: [user1, user2] },
    });

    if (!chat) {
      chat = new this.chatModel({ participants: [user1, user2], messages: [] });
      await chat.save();
    }

    return chat;
  }
    */

  async addMessage(chatId: Types.ObjectId, sendMessageDto: SendMessageDto): Promise<Chat> {
    const chat = await this.chatModel.findById(chatId);
    if (!chat) {
      throw new Error('Chat not found');
    }
    chat.messages.push(sendMessageDto as Message);
    return chat.save();
  }
}