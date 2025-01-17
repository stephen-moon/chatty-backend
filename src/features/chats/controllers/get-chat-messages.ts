import { Request, Response } from 'express';
import HTTP_STATUS from 'http-status-codes';
import mongoose from 'mongoose';
import { MessageCache } from '@services/redis/message.chache';
import { chatService } from '@services/db/chat.service';
import { IMessageData } from '@chats/interfaces/chat.interface';

const messageCache: MessageCache = new MessageCache();

export class Get {
  public async conversationList(req: Request, res: Response): Promise<void> {
    let list: IMessageData[] = [];
    const cachedList: IMessageData[] = (await messageCache.getUserConvertionList(`${req.currentUser!.userId}`)) as IMessageData[];
    if (cachedList.length) {
      list = cachedList;
    } else {
      list = await chatService.getUserConversationList(new mongoose.Types.ObjectId(req.currentUser!.userId));
    }
    res.status(HTTP_STATUS.OK).json({ message: 'User conversation list', list });
  }
}
