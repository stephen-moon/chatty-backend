import express, { Router } from 'express';
import { authMiddleware } from '@global/helpers/auth-middleware';
import { Get } from '@user/controllers/get-profile';
import { Search } from '@user/controllers/search-user';
import { Update } from '@user/controllers/update-user';

class UserRoutes {
  private router: Router;

  constructor() {
    this.router = express.Router();
  }

  public routes(): Router {
    this.router.get('/user/all/:page', authMiddleware.checkAuthentication, Get.prototype.all);
    this.router.get('/user/profile', authMiddleware.checkAuthentication, Get.prototype.profile);
    this.router.get('/user/profile/:userId', authMiddleware.checkAuthentication, Get.prototype.profileByUserId);
    this.router.get('/user/profile/posts/:userId', authMiddleware.checkAuthentication, Get.prototype.profileAndPosts);
    this.router.get('/user/suggestions', authMiddleware.checkAuthentication, Get.prototype.randomUserSuggestions);
    this.router.get('/user/search/:query', authMiddleware.checkAuthentication, Search.prototype.user);

    this.router.put('/user/basic-info', authMiddleware.checkAuthentication, Update.prototype.info);
    this.router.put('/user/social-links', authMiddleware.checkAuthentication, Update.prototype.social);
    this.router.put('/user/notification-settings', authMiddleware.checkAuthentication, Update.prototype.notificationSettings);

    return this.router;
  }
}

export const userRoutes: UserRoutes = new UserRoutes();
