import { IFileImageJobData } from '@images/interfaces/image.interface';
import { BaseQueue } from '@services/queues/base.queue';
import { imageWorker } from '@workers/image.worker';

class ImageQueue extends BaseQueue {
  constructor() {
    super('images');
    this.processJob('addUserProfileImageToDB', 5, imageWorker.addUserProfileImageToDB);
    this.processJob('addBGImageToDB', 5, imageWorker.addBGImageToDB);
    this.processJob('addImageToDB', 5, imageWorker.addImageToDB);
    this.processJob('removeImageFromDB', 5, imageWorker.removeImageFromDB);
    this.processJob('removeBGImageFromDB', 5, imageWorker.removeBGImageFromDB);
  }

  public addImageJob(name: string, data: IFileImageJobData): void {
    this.addJob(name, data);
  }
}

export const imageQueue: ImageQueue = new ImageQueue();
