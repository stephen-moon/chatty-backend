import { IBlockUserJobData } from '@follows/interfaces/follow.interface';
import { BaseQueue } from '@services/queues/base.queue';
import { blockUserWorker } from '@workers/block.worker';

class BlockUserQueue extends BaseQueue {
  constructor() {
    super('blockUser');
    this.processJob('addBlockUserToDB', 5, blockUserWorker.addBlockUserToDB);
    this.processJob('removeBlockUserFromDB', 5, blockUserWorker.addBlockUserToDB);
  }

  public addBlockUserJob(name: string, data: IBlockUserJobData): void {
    this.addJob(name, data);
  }
}

export const blockUserQueue: BlockUserQueue = new BlockUserQueue();
