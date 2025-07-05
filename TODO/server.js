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

// ✅ Define allowed origins (adjust as per your deployment)
const allowedOrigins = [
  'https://todo-frontend-ten-roan.vercel.app',  // Your deployed frontend
  'http://localhost:3000'                       // Local dev
];

// ✅ CORS for Express REST APIs
app.use(cors({
  origin: allowedOrigins,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS']
}));

app.use(express.json());

// ✅ API Routes
app.use('/api/users', userRoutes);
app.use('/api/tasks', taskRoutes);
app.use('/api/logs', logRoutes);

// ✅ Socket.IO with CORS Configured
export const io = new Server(server, {
  cors: {
    origin: allowedOrigins,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    credentials: true
  }
});

// ✅ Socket.IO Events
io.on('connection', (socket) => {
  console.log('🟢 Socket connected:', socket.id);

  socket.on('disconnect', () => {
    console.log('🔴 Socket disconnected:', socket.id);
  });
});

// ✅ MongoDB Connection
mongoose.connect(process.env.MONGO_URL, {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(() => console.log('✅ MongoDB Connected'))
.catch((err) => console.error('❌ MongoDB Connection Failed:', err));

// ✅ Start Server
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
