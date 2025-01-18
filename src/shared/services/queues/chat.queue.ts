import { IChatJobData, IMessageData } from '@chats/interfaces/chat.interface';
import { BaseQueue } from '@services/queues/base.queue';
import { chatWorker } from '@workers/chat.worker';

class ChatQueue extends BaseQueue {
  constructor() {
    super('chats');
    this.processJob('addChatMessageToDB', 5, chatWorker.addChatMessageToDB);
    this.processJob('markMessageAsDeletedInDB', 5, chatWorker.markMessageAsDeleted);
    this.processJob('markMessageAsReadInDB', 5, chatWorker.markMessageAsRead);
    this.processJob('updateMessageReactionInDB', 5, chatWorker.updateMessageReaction);
  }

  public addChatJob(name: string, data: IChatJobData | IMessageData): void {
    this.addJob(name, data);
  }
}

export const chatQueue: ChatQueue = new ChatQueue();
