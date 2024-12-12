/* eslint-disable @typescript-eslint/no-explicit-any */
import { Request, Response } from 'express';
import * as cloudinaryUploads from '@global/helpers/cloudinary-upload';
import { authMock, authMockRequest, authMockResponse } from '@root/mocks/auth.mock';
import { SignUp } from '../signup';
import { CustomError } from '@global/helpers/error-handler';
import { authService } from '@services/db/auth.service';
import { UserCache } from '@services/redis/user.cache';

jest.useFakeTimers();
jest.mock('@services/queues/base.queue');
jest.mock('@services/redis/user.cache');
jest.mock('@services/queues/user.queue');
jest.mock('@services/queues/auth.queue');
jest.mock('@global/helpers/cloudinary-upload');

describe('SignUp', () => {
  beforeEach(() => {
    jest.resetAllMocks();
  });

  afterEach(() => {
    jest.clearAllMocks();
    jest.clearAllTimers();
  });

  it('should throw an error if username is not available', () => {
    const req: Request = authMockRequest(
      {},
      {
        username: '',
        email: 'test@test.ca',
        password: 'qwert',
        avatarColor: 'red',
        avatarImage: 'data:text/plain;base64,SCVsbG8sIFdvcmxkIQ=='
      }
    ) as Request;
    const res: Response = authMockResponse();

    SignUp.prototype.create(req, res).catch((error: CustomError) => {
      expect(error.statusCode).toEqual(400);
      expect(error.serializeErrors().message).toEqual('Username is a required field');
    });
  });

  it('should throw an error if username lenght is less than minimum length', () => {
    const req: Request = authMockRequest(
      {},
      {
        username: 'Te',
        email: 'test@test.ca',
        password: 'qwerty',
        avatarColor: 'red',
        avatarImage: 'data:text/plain;base64,SCVsbG8sIFdvcmxkIQ=='
      }
    ) as Request;
    const res: Response = authMockResponse();
    SignUp.prototype.create(req, res).catch((error: CustomError) => {
      expect(error.statusCode).toEqual(400);
      expect(error.serializeErrors().message).toEqual('Invalid username');
    });
  });

  it('should throw an error if username length is greater than maximum length', () => {
    const req: Request = authMockRequest(
      {},
      {
        username: 'mathmatics',
        email: 'test@test.ca',
        password: 'qwerty',
        avatarColor: 'red',
        avatarImage: 'data:text/plain;base64,SCVsbG8sIFdvcmxkIQ=='
      }
    ) as Request;
    const res: Response = authMockResponse();
    SignUp.prototype.create(req, res).catch((error: CustomError) => {
      expect(error.statusCode).toEqual(400);
      expect(error.serializeErrors().message).toEqual('Invalid username');
    });
  });

  it('should throw an error if email is not valid', () => {
    const req: Request = authMockRequest(
      {},
      {
        username: 'Testuser',
        email: 'test@test',
        password: 'qwerty',
        avatarColor: 'red',
        avatarImage: 'data:text/plain;base64,SCVsbG8sIFdvcmxkIQ=='
      }
    ) as Request;
    const res: Response = authMockResponse();
    SignUp.prototype.create(req, res).catch((error: CustomError) => {
      expect(error.statusCode).toEqual(400);
      expect(error.serializeErrors().message).toEqual('Email must be valid');
    });
  });

  it('should throw an error if email is not available', () => {
    const req: Request = authMockRequest(
      {},
      {
        username: 'Testuser',
        email: '',
        password: 'qwerty',
        avatarColor: 'red',
        avatarImage: 'data:text/plain;base64,SCVsbG8sIFdvcmxkIQ=='
      }
    ) as Request;
    const res: Response = authMockResponse();
    SignUp.prototype.create(req, res).catch((error: CustomError) => {
      expect(error.statusCode).toEqual(400);
      expect(error.serializeErrors().message).toEqual('Email is a required field');
    });
  });

  it('should throw an error if password is not available', () => {
    const req: Request = authMockRequest(
      {},
      {
        username: 'Testuser',
        email: 'test@test',
        password: '',
        avatarColor: 'red',
        avatarImage: 'data:text/plain;base64,SCVsbG8sIFdvcmxkIQ=='
      }
    ) as Request;
    const res: Response = authMockResponse();
    SignUp.prototype.create(req, res).catch((error: CustomError) => {
      expect(error.statusCode).toEqual(400);
      expect(error.serializeErrors().message).toEqual('Password is a required field');
    });
  });

  it('should throw an error if password lenghth is less than minimu length', () => {
    const req: Request = authMockRequest(
      {},
      {
        username: 'Testuser',
        email: 'test@test',
        password: 'abc',
        avatarColor: 'red',
        avatarImage: 'data:text/plain;base64,SCVsbG8sIFdvcmxkIQ=='
      }
    ) as Request;
    const res: Response = authMockResponse();
    SignUp.prototype.create(req, res).catch((error: CustomError) => {
      expect(error.statusCode).toEqual(400);
      expect(error.serializeErrors().message).toEqual('Invalid password');
    });
  });

  it('should throw an error if password lenghth is greater than maximum length', () => {
    const req: Request = authMockRequest(
      {},
      {
        username: 'Testuser',
        email: 'test@test',
        password: 'mathematics1',
        avatarColor: 'red',
        avatarImage: 'data:text/plain;base64,SCVsbG8sIFdvcmxkIQ=='
      }
    ) as Request;
    const res: Response = authMockResponse();
    SignUp.prototype.create(req, res).catch((error: CustomError) => {
      expect(error.statusCode).toEqual(400);
      expect(error.serializeErrors().message).toEqual('Invalid password');
    });
  });

  it('should throw unathorize error if user already exist', () => {
    const req: Request = authMockRequest(
      {},
      {
        username: 'Testuser',
        email: 'test@test.ca',
        password: 'qwerty',
        avatarColor: 'red',
        avatarImage: 'data:text/plain;base64,SCVsbG8sIFdvcmxkIQ=='
      }
    ) as Request;
    const res: Response = authMockResponse();

    jest.spyOn(authService, 'getUserByUsernameOrEmail').mockResolvedValue(authMock);
    SignUp.prototype.create(req, res).catch((error: CustomError) => {
      expect(error.statusCode).toEqual(400);
      expect(error.serializeErrors().message).toEqual('Invalid credentials');
    });
  });

  it('should set session data for valid credentials and send correc json response', async () => {
    const req: Request = authMockRequest(
      {},
      {
        username: 'Testuser',
        email: 'test@test.ca',
        password: 'qwerty',
        avatarColor: 'red',
        avatarImage: 'data:text/plain;base64,SCVsbG8sIFdvcmxkIQ=='
      }
    ) as Request;
    const res: Response = authMockResponse();

    jest.spyOn(authService, 'getUserByUsernameOrEmail').mockResolvedValue(null as any);
    const userSpy = jest.spyOn(UserCache.prototype, 'saveUserToCache');
    jest.spyOn(cloudinaryUploads, 'uploads').mockImplementation((): any => Promise.resolve({ version: '1234', public_id: '123456' }));

    await SignUp.prototype.create(req, res);
    console.log(userSpy.mock);
    expect(req.session?.jwt).toBeDefined();
    expect(res.json).toHaveBeenCalledWith({
      message: 'User created successfully',
      user: userSpy.mock.calls[0][2],
      token: req.session?.jwt
    });
  });
});
