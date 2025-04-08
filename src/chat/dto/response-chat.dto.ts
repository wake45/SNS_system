import { ChatDocument } from '../schemas/chat.schema';

export class ChatResponseDto {
    chatId: string;

    constructor(chat: ChatDocument) {
        this.chatId = chat._id.toString();
    }
}
