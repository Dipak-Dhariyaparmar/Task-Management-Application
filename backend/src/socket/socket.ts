import { Server as HTTPServer } from 'http';
import { Server, Socket } from 'socket.io';
import { verifyToken } from '../utils/jwt';

export let io: Server;

export const initSocket = (httpServer: HTTPServer): Server => {
  io = new Server(httpServer, {
    cors: {
      origin: process.env.FRONTEND_URL || 'http://localhost:5173/task-management',
      methods: ['GET', 'POST'],
      credentials: true,
    },
  });

  io.use((socket, next) => {
    const token = socket.handshake.auth.token;

    if (!token) {
      return next(new Error('Authentication error'));
    }

    try {
      const decoded = verifyToken(token);

      socket.data.user = {
        id: decoded.id,
        email: decoded.email,
        role: decoded.role,
      };

      next();
    } catch (error) {
      return next(new Error('Invalid token'));
    }
  });

  io.on('connection', (socket: Socket) => {
    console.log(`User connected: ${socket.data.user.email} (${socket.id})`);

    socket.on('join', (userId: string) => {
      if (userId !== socket.data.user.id) {
        return;
      }

      socket.join(`user:${socket.data.user.id}`);
      console.log(`User is: -  ${socket.data.user.id} to joined room user:${socket.data.user.id}`);
    });

    socket.on('disconnect', () => {
      console.log(`User disconnected: ${socket.data.user.email} to (${socket.id})`);
    });
  });

  return io;
};