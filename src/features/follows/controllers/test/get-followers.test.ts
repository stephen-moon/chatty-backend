import { Request, Response } from 'express';
import mongoose from 'mongoose';
import { authUserPayload } from '@root/mocks/auth.mock';
import { followMockRequest, followMockResponse, mockFollowData } from '@root/mocks/follows.mock';
import { FollowCache } from '@services/redis/follow.cache';
import { Get } from '@follows/controllers/get-follow';
import { followService } from '@services/db/follow.service';
import { existingUserTwo } from '@root/mocks/user.mock';

jest.useFakeTimers();
jest.mock('@services/queues/base.queue');
jest.mock('@services/redis/follow.cache');

describe('Get', () => {
  beforeEach(() => {
    jest.restoreAllMocks();
  });

  afterEach(() => {
    jest.clearAllMocks();
    jest.clearAllTimers();
  });

  describe('userFollowing', () => {
    it('should send correct json response if user following exist in cache', async () => {
      const req: Request = followMockRequest({}, authUserPayload) as Request;
      const res: Response = followMockResponse();
      jest.spyOn(FollowCache.prototype, 'getFollowsFromCache').mockResolvedValue([mockFollowData]);

      await Get.prototype.userFollowing(req, res);
      expect(FollowCache.prototype.getFollowsFromCache).toHaveBeenCalledWith(`following:${req.currentUser?.userId}`);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        message: 'User following',
        following: [mockFollowData]
      });
    });

    it('should send correct json response if user following exist in database', async () => {
      const req: Request = followMockRequest({}, authUserPayload) as Request;
      const res: Response = followMockResponse();
      jest.spyOn(FollowCache.prototype, 'getFollowsFromCache').mockResolvedValue([]);
      jest.spyOn(followService, 'getFolloweeData').mockResolvedValue([mockFollowData]);

      await Get.prototype.userFollowing(req, res);
      expect(followService.getFolloweeData).toHaveBeenCalledWith(new mongoose.Types.ObjectId(req.currentUser!.userId));
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        message: 'User following',
        following: [mockFollowData]
      });
    });

    it('should return empty following if user following does not exist', async () => {
      const req: Request = followMockRequest({}, authUserPayload) as Request;
      const res: Response = followMockResponse();
      jest.spyOn(FollowCache.prototype, 'getFollowsFromCache').mockResolvedValue([]);
      jest.spyOn(followService, 'getFolloweeData').mockResolvedValue([]);

      await Get.prototype.userFollowing(req, res);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        message: 'User following',
        following: []
      });
    });
  });

  describe('userFollowers', () => {
    it('should send correct json response if user follower exist in cache', async () => {
      const req: Request = followMockRequest({}, authUserPayload, { userId: `${existingUserTwo._id}` }) as Request;
      const res: Response = followMockResponse();
      jest.spyOn(FollowCache.prototype, 'getFollowsFromCache').mockResolvedValue([mockFollowData]);

      await Get.prototype.userFollowers(req, res);
      expect(FollowCache.prototype.getFollowsFromCache).toHaveBeenCalledWith(`followers:${req.params.userId}`);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        message: 'User followers',
        followers: [mockFollowData]
      });
    });

    it('should send correct json response if user following exist in database', async () => {
      const req: Request = followMockRequest({}, authUserPayload, { userId: `${existingUserTwo._id}` }) as Request;
      const res: Response = followMockResponse();
      jest.spyOn(FollowCache.prototype, 'getFollowsFromCache').mockResolvedValue([]);
      jest.spyOn(followService, 'getFollowerData').mockResolvedValue([mockFollowData]);

      await Get.prototype.userFollowers(req, res);
      expect(followService.getFollowerData).toHaveBeenCalledWith(new mongoose.Types.ObjectId(req.params.userId));
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        message: 'User followers',
        followers: [mockFollowData]
      });
    });

    it('should return empty following if user following does not exist', async () => {
      const req: Request = followMockRequest({}, authUserPayload, { userId: `${existingUserTwo._id}` }) as Request;
      const res: Response = followMockResponse();
      jest.spyOn(FollowCache.prototype, 'getFollowsFromCache').mockResolvedValue([]);
      jest.spyOn(followService, 'getFollowerData').mockResolvedValue([]);

      await Get.prototype.userFollowers(req, res);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        message: 'User followers',
        followers: []
      });
    });
  });
});
