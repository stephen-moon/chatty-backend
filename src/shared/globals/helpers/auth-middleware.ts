import { Request, Response, NextFunction } from 'express';
import JWT from 'jsonwebtoken';
import { config } from '@root/config';
import { NotAuthorizedError } from './error-handler';
import { AuthPayload } from '@auth/interfaces/auth.interface';

class AuthMiddelware {
  public verifyUser(req: Request, _res: Response, next: NextFunction): void {
    if (!req.session?.jwt) {
      throw new NotAuthorizedError('Token is not available.  Please login again.');
    }

    try {
      const payload: AuthPayload = JWT.verify(req.session?.jwt, config.JWT_TOKEN!) as AuthPayload;
      req.currentUser = payload;
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (error) {
      throw new NotAuthorizedError('Token is invalid.  Please login again.');
    }

    next();
  }

  public checkAuthentication(req: Request, _res: Response, next: NextFunction): void {
    if (!req.currentUser) {
      throw new NotAuthorizedError('Authentication is required to access this route.');
    }

    next();
  }
}

export const authMiddleware: AuthMiddelware = new AuthMiddelware();
