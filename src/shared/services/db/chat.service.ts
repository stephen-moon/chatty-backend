import { IMessageData } from '@chats/interfaces/chat.interface';
import { IConversationDocument } from '@chats/interfaces/conversation.interface';
import { MessageModel } from '@chats/models/chat.schema';
import { ConversationModel } from '@chats/models/conversation.schema';

class ChatService {
  public async addMessageToDB(data: IMessageData): Promise<void> {
    const conversations: IConversationDocument[] = await ConversationModel.find({ _id: data?.conversationId }).exec();
    if (conversations.length === 0) {
      await ConversationModel.create({
        _id: data?.conversationId,
        senderId: data.senderId,
        receiverId: data.receiverId
      });
    }

    await MessageModel.create({
      _id: data._id,
      conversationId: data.conversationId,
      senderId: data.senderId,
      receiverId: data.receiverId,
      senderUsername: data.senderUsername,
      senderAvatarColor: data.senderAvatarColor,
      senderProfilePicture: data.senderProfilePicture,
      receiverUsername: data.receiverUsername,
      receiverAvatarColor: data.receiverAvatarColor,
      receiverProfilePicture: data.receiverProfilePicture,
      body: data.body,
      gifUrl: data.gifUrl,
      isRead: data.isRead,
      selectedImage: data.selectedImage,
      reaction: data.reaction,
      createdAt: data.createdAt
    });
  }
}

export const chatService: ChatService = new ChatService();
