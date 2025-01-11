import express, { Router } from 'express';
import { authMiddleware } from '@global/helpers/auth-middleware';
import { Add } from '@follows/controllers/follow-user';
import { Remove } from '@follows/controllers/unfollow-user';

class FollowRoutes {
  private router: Router;

  constructor() {
    this.router = express.Router();
  }

  public routes(): Router {
    this.router.put('/user/follow/:followeeId', authMiddleware.checkAuthentication, Add.prototype.follow);
    this.router.put('/user/unfollow/:followeeId', authMiddleware.checkAuthentication, Remove.prototype.follow);

    return this.router;
  }
}

export const followRoutes: FollowRoutes = new FollowRoutes();
