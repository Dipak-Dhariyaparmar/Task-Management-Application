import 'dotenv/config';
import http from 'http';
import app from './app';
import connectDB from './config/database';
import { initSocket } from './socket/socket';

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  try {
    await connectDB();

    const httpServer = http.createServer(app);

    initSocket(httpServer);

    httpServer.listen(PORT, () => {
      console.log(`Server running on http://localhost:${PORT}`);
      console.log('WebSocket server ready for connections');
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

startServer();