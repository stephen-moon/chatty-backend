import { IFollowJobData } from '@follows/interfaces/follow.interface';
import { BaseQueue } from '@services/queues/base.queue';
import { followWorker } from '@workers/follow.worker';

class FollowQueue extends BaseQueue {
  constructor() {
    super('follows');
    this.processJob('addFollowToDB', 5, followWorker.addFollowToDB);
    this.processJob('removeFollowFromDB', 5, followWorker.removeFollowFromDB);
  }

  public addFollowJob(name: string, data: IFollowJobData): void {
    this.addJob(name, data);
  }
}

export const followQueue: FollowQueue = new FollowQueue();
