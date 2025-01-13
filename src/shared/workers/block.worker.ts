import { DoneCallback, Job } from 'bull';
import Logger from 'bunyan';
import { config } from '@root/config';
import { blockUserService } from '@services/db/block-user.service';

const log: Logger = config.createLogger('blockUserWorker');

class BlockUserWorker {
  async addBlockUserToDB(job: Job, done: DoneCallback): Promise<void> {
    try {
      const { keyOne, keyTwo, type } = job.data;
      if (type === 'block') {
        blockUserService.blockUser(keyOne, keyTwo);
      } else {
        blockUserService.unblockUser(keyOne, keyTwo);
      }
      job.progress(100);
      done(null, job.data);
    } catch (error) {
      log.error(error);
      done(error as Error);
    }
  }
}

export const blockUserWorker: BlockUserWorker = new BlockUserWorker();
