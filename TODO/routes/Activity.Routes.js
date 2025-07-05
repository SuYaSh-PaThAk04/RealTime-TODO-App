import express from 'express';
import { protect } from '../Middleware/Auth.Middleware.js';
import { getRecentLogs } from "../controllers/Activity.Controllers.js";

const router = express.Router();

router.get('/', protect, getRecentLogs);

export default router;
