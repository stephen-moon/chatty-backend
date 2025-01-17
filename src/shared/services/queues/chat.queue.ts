import { IChatJobData, IMessageData } from '@chats/interfaces/chat.interface';
import { BaseQueue } from '@services/queues/base.queue';
import { chatWorker } from '@workers/chat.worker';

class ChatQueue extends BaseQueue {
  constructor() {
    super('chats');
    this.processJob('addChatMessageToDB', 5, chatWorker.addChatMessageToDB);
  }

  public addChatJob(name: string, data: IChatJobData | IMessageData): void {
    this.addJob(name, data);
  }
}

export const chatQueue: ChatQueue = new ChatQueue();
