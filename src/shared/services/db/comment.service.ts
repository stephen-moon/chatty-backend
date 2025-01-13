import { ICommentDocument, ICommentJob, ICommentNameList, IQueryComment } from '@comments/interfaces/comment.interface';
import { CommentsModel } from '@comments/models/comment.schema';
import { IPostDocument } from '@post/interfaces/post.interface';
import { PostModel } from '@post/models/post.schema';
import { UserCache } from '@services/redis/user.cache';
import { IUserDocument } from '@user/interfaces/user.interface';
import mongoose, { Query } from 'mongoose';
import { INotificationDocument } from '@notifications/interfaces/notification.interface';
import { NotificationModel } from '@notifications/models/notification.schema';
import { socketIONotificationObject } from '@sockets/notification';

const userCache: UserCache = new UserCache();

class CommentService {
  public async addPostCommentToDB(commentData: ICommentJob): Promise<void> {
    const { postId, userTo, userFrom, comment, username } = commentData;

    const comments: Promise<ICommentDocument> = CommentsModel.create(comment);
    const post: Query<IPostDocument, IPostDocument> = PostModel.findOneAndUpdate(
      { _id: postId },
      { $inc: { commentsCount: 1 } },
      { new: true }
    ) as Query<IPostDocument, IPostDocument>;
    const user: Promise<IUserDocument> = userCache.getUserFromCache(userTo) as Promise<IUserDocument>;

    const response: [ICommentDocument, IPostDocument, IUserDocument] = await Promise.all([comments, post, user]);

    // send comments notification
    if (response[2].notifications.comments && userFrom !== userTo) {
      const notificationModel: INotificationDocument = new NotificationModel();
      const notification = await notificationModel.insertNotification({
        userFrom,
        userTo,
        message: `${username} commented on your post.`,
        notificationType: 'comments',
        entityId: new mongoose.Types.ObjectId(postId),
        createdItemId: new mongoose.Types.ObjectId(response[0]._id),
        createdAt: new Date(),
        comment: comment.comment,
        post: response[1].post,
        imgId: response[1].imgId!,
        imgVersion: response[1].imgVersion!,
        gifUrl: response[1].gifUrl!,
        reaction: ''
      });

      socketIONotificationObject.emit('insert notification', notification, { userTo });

      // send to email queue
    }
  }

  public async getPostCommentsFromDB(query: IQueryComment, sort: Record<string, 1 | -1>): Promise<ICommentDocument[]> {
    const comments: ICommentDocument[] = await CommentsModel.aggregate([{ $match: query }, { $sort: sort }]);

    return comments;
  }

  public async getPostCommentsNamesFromDB(query: IQueryComment, sort: Record<string, 1 | -1>): Promise<ICommentNameList[]> {
    const commentsNamesList: ICommentNameList[] = await CommentsModel.aggregate([
      { $match: query },
      { $sort: sort },
      { $group: { _id: null, names: { $addToSet: '$username' }, count: { $sum: 1 } } },
      { $project: { _id: 0 } }
    ]);

    return commentsNamesList;
  }
}

export const commentService: CommentService = new CommentService();
