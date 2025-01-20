import express, { Router } from 'express';
import { authMiddleware } from '@global/helpers/auth-middleware';
import { Get } from '@user/controllers/get-profile';

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

    return this.router;
  }
}

export const userRoutes: UserRoutes = new UserRoutes();
