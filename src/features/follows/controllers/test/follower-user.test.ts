import { Request, Response } from 'express';
import { Server } from 'socket.io';
import { authUserPayload } from '@root/mocks/auth.mock';
import * as followServer from '@sockets/follow';
import { followMockRequest, followMockResponse } from '@root/mocks/follows.mock';
import { existingUser } from '@root/mocks/user.mock';
import { followQueue } from '@services/queues/follow.queue';
import { Add } from '@follows/controllers/follow-user';
import { UserCache } from '@services/redis/user.cache';
import { FollowCache } from '@services/redis/follow.cache';

jest.useFakeTimers();
jest.mock('@services/queues/base.queue');
jest.mock('@services/redis/user.cache');
jest.mock('@services/redis/follow.cache');

Object.defineProperties(followServer, {
  socketIOFollowObject: {
    value: new Server(),
    writable: true
  }
});

describe('Add', () => {
  beforeEach(() => {
    jest.restoreAllMocks();
  });

  afterEach(() => {
    jest.clearAllMocks();
    jest.clearAllTimers();
  });

  describe('follow', () => {
    it('should call updateFollowCountInCache', async () => {
      const req: Request = followMockRequest({}, authUserPayload, { followeeId: '6064861bc25eaa5a5d2f9bf4' }) as Request;
      const res: Response = followMockResponse();
      jest.spyOn(FollowCache.prototype, 'updateFollowCountInCache');
      jest.spyOn(UserCache.prototype, 'getUserFromCache').mockResolvedValue(existingUser);

      await Add.prototype.follow(req, res);
      expect(FollowCache.prototype.updateFollowCountInCache).toHaveBeenCalledTimes(2);
      expect(FollowCache.prototype.updateFollowCountInCache).toHaveBeenCalledWith('6064861bc25eaa5a5d2f9bf4', 'followersCount', 1);
      expect(FollowCache.prototype.updateFollowCountInCache).toHaveBeenCalledWith(`${existingUser._id}`, 'followingCount', 1);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        message: 'Following user now'
      });
    });

    it('should call saveFollowToCache', async () => {
      const req: Request = followMockRequest({}, authUserPayload, { followeeId: '6064861bc25eaa5a5d2f9bf4' }) as Request;
      const res: Response = followMockResponse();
      jest.spyOn(followServer.socketIOFollowObject, 'emit');
      jest.spyOn(FollowCache.prototype, 'saveFollowToCache');
      jest.spyOn(UserCache.prototype, 'getUserFromCache').mockResolvedValue(existingUser);

      await Add.prototype.follow(req, res);
      expect(UserCache.prototype.getUserFromCache).toHaveBeenCalledTimes(2);
      expect(FollowCache.prototype.saveFollowToCache).toHaveBeenCalledTimes(2);
      expect(FollowCache.prototype.saveFollowToCache).toHaveBeenCalledWith(
        `following:${req.currentUser!.userId}`,
        '6064861bc25eaa5a5d2f9bf4'
      );
      expect(FollowCache.prototype.saveFollowToCache).toHaveBeenCalledWith('followers:6064861bc25eaa5a5d2f9bf4', `${existingUser._id}`);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        message: 'Following user now'
      });
    });

    it('should call followQueue addFollowJob', async () => {
      const req: Request = followMockRequest({}, authUserPayload, { followeeId: '6064861bc25eaa5a5d2f9bf4' }) as Request;
      const res: Response = followMockResponse();
      const spy = jest.spyOn(followQueue, 'addFollowJob');

      await Add.prototype.follow(req, res);
      expect(followQueue.addFollowJob).toHaveBeenCalledWith('addFollowToDB', {
        keyOne: `${req.currentUser?.userId}`,
        keyTwo: '6064861bc25eaa5a5d2f9bf4',
        username: req.currentUser?.username,
        followDocumentId: spy.mock.calls[0][1].followDocumentId
      });
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        message: 'Following user now'
      });
    });
  });
});
