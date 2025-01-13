import express, { Router } from 'express';
import { authMiddleware } from '@global/helpers/auth-middleware';
import { Add } from '@follows/controllers/follow-user';
import { Remove } from '@follows/controllers/unfollow-user';
import { Get } from '@follows/controllers/get-follow';
import { AddUser } from '@follows/controllers/block-user';

class FollowRoutes {
  private router: Router;

  constructor() {
    this.router = express.Router();
  }

  public routes(): Router {
    this.router.get('/user/following', authMiddleware.checkAuthentication, Get.prototype.userFollowing);
    this.router.get('/user/followers/:userId', authMiddleware.checkAuthentication, Get.prototype.userFollowers);

    this.router.put('/user/follow/:followeeId', authMiddleware.checkAuthentication, Add.prototype.follow);
    this.router.put('/user/unfollow/:followeeId', authMiddleware.checkAuthentication, Remove.prototype.follow);

    this.router.put('/user/block/:followerId', authMiddleware.checkAuthentication, AddUser.prototype.block);
    this.router.put('/user/unblock/:followerId', authMiddleware.checkAuthentication, AddUser.prototype.unblock);

    return this.router;
  }
}

export const followRoutes: FollowRoutes = new FollowRoutes();
