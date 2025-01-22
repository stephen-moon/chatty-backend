/* eslint-disable @typescript-eslint/no-explicit-any */
import { Request, Response } from 'express';
import { Password } from '@auth/controllers/password';
import { authMock, authMockRequest, authMockResponse, authUserPayload } from '@root/mocks/auth.mock';
import { CustomError } from '@global/helpers/error-handler';
import { emailQueue } from '@services/queues/email.queue';
import { authService } from '@services/db/auth.service';
import { existingUser } from '@root/mocks/user.mock';

const WRONG_EMAIL = 'manny@me.com';
const CORRECT_EMAIL = 'test@test.ca';
const INVALID_EMAIL = 'test';
const CORRECT_PASSWORD = 'qwerty';

jest.mock('@services/queues/base.queue');
jest.mock('@services/queues/email.queue');
jest.mock('@services/db/auth.service');
jest.mock('@services/emails/mail.transport');

describe('Password', () => {
  beforeEach(() => {
    jest.restoreAllMocks();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('forgot', () => {
    it('should throw an error if email is invalid', () => {
      const req: Request = authMockRequest({}, { email: INVALID_EMAIL }) as Request;
      const res: Response = authMockResponse();
      Password.prototype.forgot(req, res).catch((error: CustomError) => {
        expect(error.statusCode).toEqual(400);
        expect(error.serializeErrors().message).toEqual('Field must be valid');
      });
    });

    it('should throw "Invalid credentials" if email does not exist', () => {
      const req: Request = authMockRequest({}, { email: WRONG_EMAIL }) as Request;
      const res: Response = authMockResponse();
      jest.spyOn(authService, 'getAuthUserByEmail').mockResolvedValue(null as any);
      Password.prototype.forgot(req, res).catch((error: CustomError) => {
        expect(error.statusCode).toEqual(400);
        expect(error.serializeErrors().message).toEqual('Invalid credentials');
      });
    });

    it('should send correct json response', async () => {
      const req: Request = authMockRequest({}, { email: CORRECT_EMAIL }) as Request;
      const res: Response = authMockResponse();
      jest.spyOn(authService, 'getAuthUserByEmail').mockResolvedValue(authMock);
      jest.spyOn(emailQueue, 'addEmailJob');
      await Password.prototype.forgot(req, res);
      expect(emailQueue.addEmailJob).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        message: 'Password reset email sent.'
      });
    });
  });

  describe('reset', () => {
    it('should throw an error if password is empty', () => {
      const req: Request = authMockRequest({}, { password: '' }) as Request;
      const res: Response = authMockResponse();
      Password.prototype.reset(req, res).catch((error: CustomError) => {
        expect(error.statusCode).toEqual(400);
        expect(error.serializeErrors().message).toEqual('Password is a required field');
      });
    });

    it('should throw an error if password and confirmPassword are different', () => {
      const req: Request = authMockRequest({}, { password: CORRECT_PASSWORD, confirmPassword: `${CORRECT_PASSWORD}2` }) as Request;
      const res: Response = authMockResponse();
      Password.prototype.reset(req, res).catch((error: CustomError) => {
        expect(error.statusCode).toEqual(400);
        expect(error.serializeErrors().message).toEqual('Passwords should match');
      });
    });

    it('should throw error if reset token has expired', () => {
      const req: Request = authMockRequest({}, { password: CORRECT_PASSWORD, confirmPassword: CORRECT_PASSWORD }, null, {
        token: ''
      }) as Request;
      const res: Response = authMockResponse();
      jest.spyOn(authService, 'getAuthUserByPasswordToken').mockResolvedValue(null as any);
      Password.prototype.reset(req, res).catch((error: CustomError) => {
        expect(error.statusCode).toEqual(400);
        expect(error.serializeErrors().message).toEqual('Reset token has expired.');
      });
    });

    it('should send correct json response', async () => {
      const req: Request = authMockRequest({}, { password: CORRECT_PASSWORD, confirmPassword: CORRECT_PASSWORD }, null, {
        token: '12sde3'
      }) as Request;
      const res: Response = authMockResponse();
      jest.spyOn(authService, 'getAuthUserByPasswordToken').mockResolvedValue(authMock);
      jest.spyOn(emailQueue, 'addEmailJob');
      await Password.prototype.reset(req, res);
      expect(emailQueue.addEmailJob).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        message: 'Password has been reset successfully.'
      });
    });

    describe('change', () => {
      it('should throw an error if currentPassword is empty', () => {
        const req: Request = authMockRequest(
          {},
          {
            currentPassword: '',
            newPassword: 'manny2',
            confirmPassword: 'manny2'
          }
        ) as Request;
        const res: Response = authMockResponse();
        Password.prototype.change(req, res).catch((error: CustomError) => {
          expect(error.statusCode).toEqual(400);
          expect(error.serializeErrors().message).toEqual('Password is a required field');
        });
      });

      it('should throw an error if newPassword is empty', () => {
        const req: Request = authMockRequest(
          {},
          {
            currentPassword: 'manny1',
            newPassword: '',
            confirmPassword: 'manny2'
          }
        ) as Request;
        const res: Response = authMockResponse();
        Password.prototype.change(req, res).catch((error: CustomError) => {
          expect(error.statusCode).toEqual(400);
          expect(error.serializeErrors().message).toEqual('Password is a required field');
        });
      });

      it('should throw an error if confirmPassword is empty', () => {
        const req: Request = authMockRequest(
          {},
          {
            currentPassword: 'manny1',
            newPassword: 'manny2',
            confirmPassword: ''
          }
        ) as Request;
        const res: Response = authMockResponse();
        Password.prototype.change(req, res).catch((error: CustomError) => {
          expect(error.statusCode).toEqual(400);
          expect(error.serializeErrors().message).toEqual('Confirm password does not match new password.');
        });
      });

      it('should throw an error if currentPassword does not exist', () => {
        const req: Request = authMockRequest(
          {},
          {
            currentPassword: 'manny1',
            newPassword: 'manny2',
            confirmPassword: 'manny2'
          },
          authUserPayload
        ) as Request;
        const res: Response = authMockResponse();
        const mockUser = {
          ...existingUser,
          comparePassword: () => false
        };
        jest.spyOn(authService, 'getAuthUserByUsername').mockResolvedValue(mockUser as any);

        Password.prototype.change(req, res).catch((error: CustomError) => {
          expect(error.statusCode).toEqual(400);
          expect(error.serializeErrors().message).toEqual('Invalid credentials');
        });
      });

      it('should send correct json response', async () => {
        const req: Request = authMockRequest(
          {},
          {
            currentPassword: 'manny1',
            newPassword: 'manny2',
            confirmPassword: 'manny2'
          },
          authUserPayload
        ) as Request;
        const res: Response = authMockResponse();
        const mockUser = {
          ...existingUser,
          comparePassword: () => true,
          hashPassword: () => 'djejdjr123482ejsj'
        };
        jest.spyOn(authService, 'getAuthUserByUsername').mockResolvedValue(mockUser as any);
        jest.spyOn(authService, 'updatePassword');
        const spy = jest.spyOn(emailQueue, 'addEmailJob');

        await Password.prototype.change(req, res);
        expect(authService.updatePassword).toHaveBeenCalledWith(`${req.currentUser!.username}`, 'djejdjr123482ejsj');
        expect(emailQueue.addEmailJob).toHaveBeenCalledWith(spy.mock.calls[0][0], spy.mock.calls[0][1]);
        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json).toHaveBeenCalledWith({
          message: 'Password updated successfully. You will be redirected shortly to the login page.'
        });
      });
    });
  });
});
