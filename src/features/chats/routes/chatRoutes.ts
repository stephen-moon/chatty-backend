import express, { Router } from 'express';
import { authMiddleware } from '@global/helpers/auth-middleware';
import { Add } from '@chats/controllers/add-chat-message';

class ChatRoutes {
  private router: Router;

  constructor() {
    this.router = express.Router();
  }

  public routes(): Router {
    this.router.post('/chat/message', authMiddleware.checkAuthentication, Add.prototype.message);

    return this.router;
  }
}

export const chatRoutes: ChatRoutes = new ChatRoutes();
