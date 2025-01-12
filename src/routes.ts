import { Application } from 'express';
import { authMiddleware } from '@global/helpers/auth-middleware';
import { serverAdapter } from '@services/queues/base.queue';
import { authRoutes } from '@auth/routes/authRoutes';
import { currentUserRoutes } from '@auth/routes/currentRoutes';
import { postRoutes } from '@post/routes/postRoutes';
import { reactionRoutes } from '@reactions/routes/reactionRoutes';
import { commentRoutes } from '@comments/routes/commentRoutes';
import { followRoutes } from '@follows/routes/followRoutes';

const BASE_PATH = '/api/v1';

export default (app: Application) => {
  const routes = () => {
    app.use('/queues', serverAdapter.getRouter());
    app.use(BASE_PATH, authRoutes.routes());
    app.use(BASE_PATH, authRoutes.signoutRoute());

    app.use(BASE_PATH, authMiddleware.verifyUser, currentUserRoutes.routes());
    app.use(BASE_PATH, authMiddleware.verifyUser, postRoutes.routes());
    app.use(BASE_PATH, authMiddleware.verifyUser, reactionRoutes.routes());
    app.use(BASE_PATH, authMiddleware.verifyUser, commentRoutes.routes());
    app.use(BASE_PATH, authMiddleware.verifyUser, followRoutes.routes());
  };
  routes();
};
