import { Request, Response } from 'express';
import { authUserPayload } from '@root/mocks/auth.mock';
import { followMockRequest, followMockResponse } from '@root/mocks/follows.mock';
import { followQueue } from '@services/queues/follow.queue';
import { FollowCache } from '@services/redis/follow.cache';
import { Remove } from '@follows/controllers/unfollow-user';

jest.useFakeTimers();
jest.mock('@services/queues/base.queue');
jest.mock('@services/redis/follow.cache');

describe('Remove', () => {
  beforeEach(() => {
    jest.restoreAllMocks();
  });

  afterEach(() => {
    jest.clearAllMocks();
    jest.clearAllTimers();
  });

  it('should send correct json response', async () => {
    const req: Request = followMockRequest({}, authUserPayload, {
      followerId: '6064861bc25eaa5a5d2f9bf4'
    }) as Request;
    const res: Response = followMockResponse();
    jest.spyOn(FollowCache.prototype, 'removeFollowFromCache');
    jest.spyOn(FollowCache.prototype, 'updateFollowCountInCache');
    jest.spyOn(followQueue, 'addFollowJob');

    await Remove.prototype.follow(req, res);
    expect(FollowCache.prototype.removeFollowFromCache).toHaveBeenCalledTimes(2);
    expect(FollowCache.prototype.removeFollowFromCache).toHaveBeenCalledWith(`following:${req.currentUser!.userId}`, req.params.followeeId);
    expect(FollowCache.prototype.removeFollowFromCache).toHaveBeenCalledWith(`followers:${req.params.followeeId}`, req.currentUser!.userId);
    expect(FollowCache.prototype.updateFollowCountInCache).toHaveBeenCalledTimes(2);
    expect(FollowCache.prototype.updateFollowCountInCache).toHaveBeenCalledWith(`${req.params.followeeId}`, 'followersCount', -1);
    expect(FollowCache.prototype.updateFollowCountInCache).toHaveBeenCalledWith(`${req.currentUser!.userId}`, 'followingCount', -1);
    expect(followQueue.addFollowJob).toHaveBeenCalledWith('removeFollowFromDB', {
      keyOne: `${req.params.followeeId}`,
      keyTwo: `${req.currentUser!.userId}`
    });
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      message: 'Unfollowed user now'
    });
  });
});
