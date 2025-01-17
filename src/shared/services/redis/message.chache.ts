import { BaseCache } from '@services/redis/base.cache';
import Logger from 'bunyan';
import { findIndex } from 'lodash';
import { config } from '@root/config';
import { ServerError } from '@global/helpers/error-handler';
import { IChatUsers, IMessageData } from '@chats/interfaces/chat.interface';
import { Helpers } from '@global/helpers/helpers';

const cacheName: string = 'messageCache';
const log: Logger = config.createLogger(cacheName);

export class MessageCache extends BaseCache {
  constructor() {
    super(cacheName);
  }

  public async addChatListToCache(senderId: string, receiverId: string, conversationId: string): Promise<void> {
    try {
      if (!this.client.isOpen) {
        await this.client.connect();
      }

      const userChatList = await this.client.LRANGE(`chatList:${senderId}`, 0, -1);
      if (userChatList.length === 0) {
        await this.client.RPUSH(`chatList:${senderId}`, JSON.stringify({ receiverId, conversationId }));
      } else {
        const receiverIndex: number = findIndex(userChatList, (listItem: string) => listItem.includes(receiverId));
        if (receiverIndex < 0) {
          await this.client.RPUSH(`chatList:${senderId}`, JSON.stringify({ receiverId, conversationId }));
        }
      }
    } catch (error) {
      log.error(error);
      throw new ServerError('Server error.  Try again.');
    }
  }

  public async addChatMessageToCache(conversationId: string, value: IMessageData): Promise<void> {
    try {
      if (!this.client.isOpen) {
        await this.client.connect();
      }

      await this.client.RPUSH(`messages:${conversationId}`, JSON.stringify(value));
    } catch (error) {
      log.error(error);
      throw new ServerError('Server error.  Try again.');
    }
  }

  public async addChatUsersToCache(value: IChatUsers): Promise<IChatUsers[]> {
    try {
      if (!this.client.isOpen) {
        await this.client.connect();
      }

      const usersList: IChatUsers[] = await this.getChatUsersList();
      const chatUsersIndex: number = findIndex(usersList, (listItem: IChatUsers) => JSON.stringify(listItem) === JSON.stringify(value));
      let chatUsersList: IChatUsers[] = [];
      if (chatUsersIndex === -1) {
        await this.client.RPUSH('chatUsers', JSON.stringify(value));
        chatUsersList = await this.getChatUsersList();
      } else {
        chatUsersList = usersList;
      }

      return chatUsersList;
    } catch (error) {
      log.error(error);
      throw new ServerError('Server error.  Try again.');
    }
  }

  public async removeChatUsersFromCache(value: IChatUsers): Promise<IChatUsers[]> {
    try {
      if (!this.client.isOpen) {
        await this.client.connect();
      }

      const usersList: IChatUsers[] = await this.getChatUsersList();
      const chatUsersIndex: number = findIndex(usersList, (listItem: IChatUsers) => JSON.stringify(listItem) === JSON.stringify(value));
      let chatUsersList: IChatUsers[] = [];
      if (chatUsersIndex > -1) {
        await this.client.LREM('chatUsers', chatUsersIndex, JSON.stringify(value));
        chatUsersList = await this.getChatUsersList();
      } else {
        chatUsersList = usersList;
      }

      return chatUsersList;
    } catch (error) {
      log.error(error);
      throw new ServerError('Server error.  Try again.');
    }
  }

  private async getChatUsersList(): Promise<IChatUsers[]> {
    const chatUsersList: IChatUsers[] = [];
    const chatUsers = await this.client.LRANGE('chatUsers', 0, -1);
    for (const item of chatUsers) {
      const chatUsers: IChatUsers = Helpers.parseJson(item) as IChatUsers;
      chatUsersList.push(chatUsers);
    }
    return chatUsersList;
  }
}
