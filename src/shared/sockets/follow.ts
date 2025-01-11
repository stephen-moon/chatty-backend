import { IFollows } from '@follows/interfaces/follow.interface';
import { Server, Socket } from 'socket.io';

export let socketIOFollowObject: Server;

export class SocketIOFollowHandler {
  private io: Server;

  constructor(io: Server) {
    this.io = io;
    socketIOFollowObject = io;
  }

  public listen(): void {
    this.io.on('connection', (socket: Socket) => {
      socket.on('unfollow user', (data: IFollows) => {
        this.io.emit('remove follow', data);
      });
    });
  }
}
