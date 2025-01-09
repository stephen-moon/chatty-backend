import mongoose from 'mongoose';
import { Request, Response } from 'express';
import { authUserPayload } from '@root/mocks/auth.mock';
import { commentNames, commentsData, reactionMockRequest, reactionMockResponse } from '@root/mocks/reactions.mock';
import { CommentCache } from '@services/redis/comment.cache';
import { Get } from '@comments/controllers/get-comments';
import { commentService } from '@services/db/comment.service';

jest.useFakeTimers();
jest.mock('@services/queues/base.queue');
jest.mock('@services/redis/comment.cache');

describe('Get', () => {
  beforeEach(() => {
    jest.restoreAllMocks();
  });

  afterEach(() => {
    jest.clearAllMocks();
    jest.clearAllTimers();
  });

  describe('comments', () => {
    it('should send correct json response if comments exist in cache', async () => {
      const req: Request = reactionMockRequest({}, {}, authUserPayload, {
        postId: '6027f77087c9d9ccb1555268'
      }) as Request;
      const res: Response = reactionMockResponse();
      jest.spyOn(CommentCache.prototype, 'getPostCommentsFromCache').mockResolvedValue([commentsData]);

      await Get.prototype.comments(req, res);
      expect(CommentCache.prototype.getPostCommentsFromCache).toHaveBeenCalledWith('6027f77087c9d9ccb1555268');
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        message: 'Post comments',
        comments: [commentsData]
      });
    });

    it('should send correct json response if comments exist in database', async () => {
      const req: Request = reactionMockRequest({}, {}, authUserPayload, {
        postId: '6027f77087c9d9ccb1555268'
      }) as Request;
      const res: Response = reactionMockResponse();
      jest.spyOn(CommentCache.prototype, 'getPostCommentsFromCache').mockResolvedValue([]);
      jest.spyOn(commentService, 'getPostCommentsFromDB').mockResolvedValue([commentsData]);

      await Get.prototype.comments(req, res);
      expect(commentService.getPostCommentsFromDB).toHaveBeenCalledWith(
        { postId: new mongoose.Types.ObjectId('6027f77087c9d9ccb1555268') },
        { createdAt: -1 }
      );
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        message: 'Post comments',
        comments: [commentsData]
      });
    });
  });

  describe('commentsNamesFromCache', () => {
    it('should send correct json response if data exist in redis', async () => {
      const req: Request = reactionMockRequest({}, {}, authUserPayload, {
        postId: '6027f77087c9d9ccb1555268'
      }) as Request;
      const res: Response = reactionMockResponse();
      jest.spyOn(CommentCache.prototype, 'getPostCommentsNamesFromCache').mockResolvedValue([commentNames]);

      await Get.prototype.commentsNames(req, res);
      expect(CommentCache.prototype.getPostCommentsNamesFromCache).toHaveBeenCalledWith('6027f77087c9d9ccb1555268');
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        message: 'Post comments names',
        comments: commentNames
      });
    });

    it('should send correct json response if data exist in database', async () => {
      const req: Request = reactionMockRequest({}, {}, authUserPayload, {
        postId: '6027f77087c9d9ccb1555268'
      }) as Request;
      const res: Response = reactionMockResponse();
      jest.spyOn(CommentCache.prototype, 'getPostCommentsNamesFromCache').mockResolvedValue([]);
      jest.spyOn(commentService, 'getPostCommentsNamesFromDB').mockResolvedValue([commentNames]);

      await Get.prototype.commentsNames(req, res);
      expect(commentService.getPostCommentsNamesFromDB).toHaveBeenCalledWith(
        { postId: new mongoose.Types.ObjectId('6027f77087c9d9ccb1555268') },
        { createdAt: -1 }
      );
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        message: 'Post comments names',
        comments: commentNames
      });
    });

    it('should return empty comments if data does not exist in redis and database', async () => {
      const req: Request = reactionMockRequest({}, {}, authUserPayload, {
        postId: '6027f77087c9d9ccb1555268'
      }) as Request;
      const res: Response = reactionMockResponse();
      jest.spyOn(CommentCache.prototype, 'getPostCommentsNamesFromCache').mockResolvedValue([]);
      jest.spyOn(commentService, 'getPostCommentsNamesFromDB').mockResolvedValue([]);

      await Get.prototype.commentsNames(req, res);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        message: 'Post comments names',
        comments: []
      });
    });
  });

  describe('singleComment', () => {
    it('should send correct json response from cache', async () => {
      const req: Request = reactionMockRequest({}, {}, authUserPayload, {
        commentId: '6064861bc25eaa5a5d2f9bf4',
        postId: '6027f77087c9d9ccb1555268'
      }) as Request;
      const res: Response = reactionMockResponse();
      jest.spyOn(CommentCache.prototype, 'getSinglePostCommentFromCache').mockResolvedValue([commentsData]);

      await Get.prototype.singleComment(req, res);
      expect(CommentCache.prototype.getSinglePostCommentFromCache).toHaveBeenCalledWith(
        '6027f77087c9d9ccb1555268',
        '6064861bc25eaa5a5d2f9bf4'
      );
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        message: 'Single post comment',
        comments: commentsData
      });
    });

    it('should send correct json response from database', async () => {
      const req: Request = reactionMockRequest({}, {}, authUserPayload, {
        commentId: '6064861bc25eaa5a5d2f9bf4',
        postId: '6027f77087c9d9ccb1555268'
      }) as Request;
      const res: Response = reactionMockResponse();
      jest.spyOn(CommentCache.prototype, 'getSinglePostCommentFromCache').mockResolvedValue([]);
      jest.spyOn(commentService, 'getPostCommentsFromDB').mockResolvedValue([commentsData]);

      await Get.prototype.singleComment(req, res);
      expect(commentService.getPostCommentsFromDB).toHaveBeenCalledWith(
        { _id: new mongoose.Types.ObjectId('6064861bc25eaa5a5d2f9bf4') },
        { createdAt: -1 }
      );
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        message: 'Single post comment',
        comments: commentsData
      });
    });
  });
});
