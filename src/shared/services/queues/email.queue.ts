import { BaseQueue } from '@services/queues/base.queue';
import { IEmailJob } from '@user/interfaces/user.interface';
import { emailWorker } from '@workers/email.worker';

class EmailQueue extends BaseQueue {
  constructor() {
    super('emails');
    this.processJob('forgotPasswordEmail', 5, emailWorker.addNotificationEmail);
    this.processJob('commentsEmail', 5, emailWorker.addNotificationEmail);
    this.processJob('followsEmail', 5, emailWorker.addNotificationEmail);
    this.processJob('reactionsEmail', 5, emailWorker.addNotificationEmail);
    this.processJob('directMessagesEmail', 5, emailWorker.addNotificationEmail);
    this.processJob('changePassword', 5, emailWorker.addNotificationEmail);
  }

  public addEmailJob(name: string, data: IEmailJob): void {
    this.addJob(name, data);
  }
}

export const emailQueue: EmailQueue = new EmailQueue();
