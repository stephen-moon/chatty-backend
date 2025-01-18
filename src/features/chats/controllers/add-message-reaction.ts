import { Request, Response } from 'express';
import HTTP_STATUS from 'http-status-codes';
import mongoose from 'mongoose';
import { MessageCache } from '@services/redis/message.chache';
import { IMessageData } from '@chats/interfaces/chat.interface';
import { socketIOChatObject } from '@sockets/chat';
import { chatQueue } from '@services/queues/chat.queue';

const messageCache: MessageCache = new MessageCache();

export class Message {
  public async reaction(req: Request, res: Response): Promise<void> {
    const { conversationId, messageId, reaction, type } = req.body;

    const updatedMessage: IMessageData = await messageCache.updateMessageReaction(
      `${conversationId}`,
      `${messageId}`,
      `${reaction}`,
      `${req.currentUser!.username}`,
      type
    );
    socketIOChatObject.emit('message reaction', updatedMessage);
    chatQueue.addChatJob('updateMessageReactionInDB', {
      messageId: new mongoose.Types.ObjectId(messageId as string),
      senderName: req.currentUser!.username,
      reaction,
      type
    });

    res.status(HTTP_STATUS.OK).json({ message: 'Message reaction updated' });
  }
}
