import express from 'express';
import { protect } from '../Middleware/Auth.Middleware.js';
import { getAllTasks, createTask, updateTask, deleteTask,smartAssignTask } from '../controllers/Task.Controller.js';

const router = express.Router();

router.get('/', protect, getAllTasks);
router.post('/', protect, createTask);
router.put('/:taskId', protect, updateTask);
router.delete('/:taskId', protect, deleteTask);
router.post('/:taskId/smart-assign', protect, smartAssignTask);

export default router;
