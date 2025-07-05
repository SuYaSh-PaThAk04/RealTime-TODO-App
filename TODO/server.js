import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import http from 'http';
import { Server } from 'socket.io';
import dotenv from 'dotenv';

import userRoutes from './routes/User.Routes.js';
import taskRoutes from './routes/Task.Routes.js';
import logRoutes from './routes/Activity.Routes.js';

dotenv.config();

const app = express();
const server = http.createServer(app);

const allowedOrigins = [
  'https://todo-frontend-oolwiy50u-suyash-pathak04s-projects.vercel.app',
  'https://todo-frontend-ten-roan.vercel.app'
];


app.use(cors({
  origin: allowedOrigins,
  credentials: true,
}));

app.use(express.json());

export const io = new Server(server, {
  cors: {
    origin: allowedOrigins,
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    credentials: true,
  },
});


app.use('/api/users', userRoutes);
app.use('/api/tasks', taskRoutes);
app.use('/api/logs', logRoutes);


mongoose.connect(process.env.MONGO_URL, {
  useNewUrlParser: true,
  useUnifiedTopology: true
}).then(() => console.log('✅ MongoDB Connected'))
  .catch(err => console.error('❌ MongoDB Error:', err));


io.on('connection', (socket) => {
  console.log('🔌 Socket connected:', socket.id);

  socket.on('disconnect', () => {
    console.log('❌ Socket disconnected:', socket.id);
  });
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));

