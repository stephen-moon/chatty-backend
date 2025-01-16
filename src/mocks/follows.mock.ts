import { Response } from 'express';
import { IJWT } from './auth.mock';
import { AuthPayload } from '@auth/interfaces/auth.interface';
import { existingUserTwo } from '@root/mocks/user.mock';
import mongoose from 'mongoose';
import { IFollowData } from '@follows/interfaces/follow.interface';
import { config } from '@root/config';

export const followMockRequest = (sessionData: IJWT, currentUser?: AuthPayload | null, params?: IParams) => ({
  session: sessionData,
  params,
  currentUser
});

export const followMockResponse = (): Response => {
  const res: Response = {} as Response;
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
};

export interface IParams {
  followerId?: string;
  followeeId?: string;
  userId?: string;
}

export const mockFollowData: IFollowData = {
  avatarColor: `${existingUserTwo.avatarColor}`,
  followersCount: existingUserTwo.followersCount,
  followingCount: existingUserTwo.followingCount,
  profilePicture: `${existingUserTwo.profilePicture}`,
  postsCount: existingUserTwo.postsCount,
  username: `${existingUserTwo.username}`,
  uId: `${existingUserTwo.uId}`,
  _id: new mongoose.Types.ObjectId(existingUserTwo._id)
};

export const followData = {
  _id: '605727cd646cb50e668a4e13',
  followerId: {
    username: 'Manny',
    postCount: 5,
    avatarColor: '#ff9800',
    followersCount: 3,
    followingCount: 5,
    profilePicture: `${config.CLOUD_HOST}/${config.CLOUD_NAME}/image/upload/605727cd646eb50e668a4e13`
  },
  followeeId: {
    username: 'Danny',
    postCount: 10,
    avatarColor: '#ff9800',
    followersCount: 3,
    followingCount: 5,
    profilePicture: `${config.CLOUD_HOST}/${config.CLOUD_NAME}/image/upload/605727cd646eb50e668a4e13`
  }
};
