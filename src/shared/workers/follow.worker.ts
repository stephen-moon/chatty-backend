import { DoneCallback, Job } from 'bull';
import Logger from 'bunyan';
import { config } from '@root/config';
import { followService } from '@services/db/follow.service';

const log: Logger = config.createLogger('followWorker');

class FollowWorker {
  async addFollowToDB(job: Job, done: DoneCallback): Promise<void> {
    try {
      const { keyOne, keyTwo, username, followDocumentId } = job.data;
      await followService.addFollowToDB(keyOne, keyTwo, username, followDocumentId);
      job.progress(100);
      done(null, job.data);
    } catch (error) {
      log.error(error);
      done(error as Error);
    }
  }

  async removeFollowFromDB(job: Job, done: DoneCallback): Promise<void> {
    try {
      const { keyOne, keyTwo } = job.data;
      await followService.removeFollowFromDB(keyOne, keyTwo);
      job.progress(100);
      done(null, job.data);
    } catch (error) {
      log.error(error);
      done(error as Error);
    }
  }
}

export const followWorker: FollowWorker = new FollowWorker();
