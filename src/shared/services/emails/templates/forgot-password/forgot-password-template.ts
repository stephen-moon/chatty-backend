import fs from 'fs';
import ejs from 'ejs';
import { config } from '@root/config';

class ForgotPasswordTemplate {
  public passwordResetTemplate(username: string, resetLink: string): string {
    return ejs.render(fs.readFileSync(__dirname + '/forgot-password-template.ejs', 'utf-8'), {
      username,
      resetLink,
      image_url: `${config.CLOUD_HOST}/${config.CLOUD_NAME}/image/upload/v1732829372/6748e0bc9a08e64969f7c56a`
    });
  }
}

export const forgotPasswordTemplate: ForgotPasswordTemplate = new ForgotPasswordTemplate();
