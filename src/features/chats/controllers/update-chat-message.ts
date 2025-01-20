import { Request, Response } from 'express';
import HTTP_STATUS from 'http-status-codes';
import mongoose from 'mongoose';
import { MessageCache } from '@services/redis/message.cache';
import { IMessageData } from '@chats/interfaces/chat.interface';
import { socketIOChatObject } from '@sockets/chat';
import { chatQueue } from '@services/queues/chat.queue';
import { joiValidation } from '@global/decorators/joi-validation.decorators';
import { markChatSchema } from '@chats/schemes/chat';

const messageCache: MessageCache = new MessageCache();

export class Update {
  @joiValidation(markChatSchema)
  public async message(req: Request, res: Response): Promise<void> {
    const { senderId, receiverId } = req.body;

    const updatedMessage: IMessageData = await messageCache.updateChatMessages(`${senderId}`, `${receiverId}`);
    socketIOChatObject.emit('message read', updatedMessage);
    socketIOChatObject.emit('chat list', updatedMessage);
    chatQueue.addChatJob('markMessageAsReadInDB', {
      senderId: new mongoose.Types.ObjectId(senderId as string),
      receiverId: new mongoose.Types.ObjectId(receiverId as string)
    });

    res.status(HTTP_STATUS.OK).json({ message: 'Message marked as read' });
  }
}
