import fs from 'fs';
import ejs from 'ejs';
import { INotificationTemplate } from '@notifications/interfaces/notification.interface';

class NotificationTemplate {
  public notificationMessageTemplate(templeateParams: INotificationTemplate): string {
    const { username, header, message } = templeateParams;
    return ejs.render(fs.readFileSync(__dirname + '/notification.ejs', 'utf-8'), {
      username,
      header,
      message,
      image_url: 'https://w7.pngwing.com/pngs/120/102/png-transparent-padlock-logo-computer-icons-padlock-technic-logo-password-lock.png'
    });
  }
}

export const notificationTemplate: NotificationTemplate = new NotificationTemplate();
