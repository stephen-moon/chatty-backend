import { authRoutes } from '@auth/routes/authRoutes';
import { currentUserRoute } from '@auth/routes/currentRoutes';
import { postRoute } from '@post/routes/postRoutes';
import { authMiddleware } from '@global/helpers/auth-middleware';
import { serverAdapter } from '@services/queues/base.queue';
import { Application } from 'express';

const BASE_PATH = '/api/v1';

export default (app: Application) => {
  const routes = () => {
    app.use('/queues', serverAdapter.getRouter());
    app.use(BASE_PATH, authRoutes.routes());
    app.use(BASE_PATH, authRoutes.signoutRoute());

    app.use(BASE_PATH, authMiddleware.verifyUser, currentUserRoute.routes());
    app.use(BASE_PATH, authMiddleware.verifyUser, postRoute.routes());
  };
  routes();
};
