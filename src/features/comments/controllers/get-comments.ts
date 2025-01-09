import { Request, Response } from 'express';
import HTTP_STATUS from 'http-status-codes';
import { CommentCache } from '@services/redis/comment.cache';
import { ICommentDocument, ICommentNameList } from '@comments/interfaces/comment.interface';
import { commentService } from '@services/db/comment.service';
import mongoose from 'mongoose';

const commentCache: CommentCache = new CommentCache();

export class Get {
  public async comments(req: Request, res: Response): Promise<void> {
    const { postId } = req.params;
    const cachedComments: ICommentDocument[] = await commentCache.getPostCommentsFromCache(postId);
    const comments: ICommentDocument[] = cachedComments.length
      ? cachedComments
      : await commentService.getPostCommentsFromDB({ postId: new mongoose.Types.ObjectId(postId) }, { createdAt: -1 });

    res.status(HTTP_STATUS.OK).json({ message: 'Post comments', comments });
  }

  public async commentsNames(req: Request, res: Response): Promise<void> {
    const { postId } = req.params;
    const cachedCommentsNames: ICommentNameList[] = await commentCache.getPostCommentsNamesFromCache(postId);
    const commentsNames: ICommentNameList[] = cachedCommentsNames.length
      ? cachedCommentsNames
      : await commentService.getPostCommentsNamesFromDB({ postId: new mongoose.Types.ObjectId(postId) }, { createdAt: -1 });

    res.status(HTTP_STATUS.OK).json({ message: 'Post comments names', commentsNames });
  }

  public async singleComment(req: Request, res: Response): Promise<void> {
    const { postId, commentId } = req.params;
    const cachedComment: ICommentDocument[] = await commentCache.getSinglePostCommentFromCache(postId, commentId);
    const comment: ICommentDocument[] = cachedComment.length
      ? cachedComment
      : await commentService.getPostCommentsFromDB({ _id: new mongoose.Types.ObjectId(commentId) }, { createdAt: -1 });

    res.status(HTTP_STATUS.OK).json({ message: 'Single post comment', comment: comment[0] });
  }
}
