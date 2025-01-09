import { ICommentJob } from '@comments/interfaces/comment.interface';
import { BaseQueue } from '@services/queues/base.queue';
import { commentWorker } from '@workers/comment.worker';

class CommentQueue extends BaseQueue {
  constructor() {
    super('comments');
    this.processJob('addCommentToDB', 5, commentWorker.addCommentToDB);
  }

  public addCommentJob(name: string, data: ICommentJob): void {
    this.addJob(name, data);
  }
}

export const commentQueue: CommentQueue = new CommentQueue();
