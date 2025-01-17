import { IMessageData } from '@chats/interfaces/chat.interface';
import { IConversationDocument } from '@chats/interfaces/conversation.interface';
import { MessageModel } from '@chats/models/chat.schema';
import { ConversationModel } from '@chats/models/conversation.schema';
import { ObjectId } from 'mongodb';

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
      senderUsername: data.senderUsername,
      senderAvatarColor: data.senderAvatarColor,
      senderProfilePicture: data.senderProfilePicture,
      receiverId: data.receiverId,
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

  public async getUserConversationList(userId: ObjectId): Promise<IMessageData[]> {
    const messages: IMessageData[] = await MessageModel.aggregate([
      { $match: { $or: [{ senderId: userId }, { receiverId: userId }] } },
      {
        $group: {
          _id: '$conversationId',
          result: { $last: '$$ROOT' }
        }
      },
      {
        $project: {
          _id: '$result._id',
          conversationId: '$result.conversationId',
          senderId: '$result.senderId',
          senderUsername: '$result.senderUsername',
          senderAvatarColor: '$result.senderAvatarColor',
          senderProfilePicture: '$result.senderProfilePicture',
          receiverId: '$result.receiverId',
          receiverUsername: '$result.receiverUsername',
          receiverAvatarColor: '$result.receiverAvatarColor',
          receiverProfilePicture: '$result.receiverProfilePicture',
          body: '$result.body',
          gifUrl: '$result.gifUrl',
          isRead: '$result.isRead',
          selectedImage: '$result.selectedImage',
          reaction: '$result.reaction',
          createdAt: '$result.createdAt'
        }
      },
      { $sort: { createdAt: 1 } }
    ]);

    return messages;
  }

  public async getMessages(senderId: ObjectId, receiverId: ObjectId, sort: Record<string, 1 | -1>): Promise<IMessageData[]> {
    const query = {
      $or: [
        { senderId, receiverId },
        { senderId: receiverId, receiverId: senderId }
      ]
    };
    const messages: IMessageData[] = await MessageModel.aggregate([{ $match: query }, { $sort: sort }]);

    return messages;
  }
}

export const chatService: ChatService = new ChatService();
