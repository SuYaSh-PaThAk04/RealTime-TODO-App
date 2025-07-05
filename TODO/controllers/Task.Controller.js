import Task from '../models/Task.Model.js';
import ActionLog from '../models/ActionLog.Model.js';
import User from '../models/Users.Model.js';
import { io } from '../server.js';

const logAction = async (actionType, userId, taskId, description) => {
  await ActionLog.create({
    actionType,
    user: userId,
    taskId,
    description
  });
};

export const getAllTasks = async (req, res) => {
  try {
    const tasks = await Task.find().populate('assignedUser', 'username email');
    res.status(200).json(tasks);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch tasks', error: err.message });
  }
};

export const createTask = async (req, res) => {
  const { title, description, assignedUser, status, priority } = req.body;

  if (!title) return res.status(400).json({ message: 'Title is required' });

  try {
    const existingTask = await Task.findOne({ title });
    if (existingTask || ['Todo', 'In Progress', 'Done'].includes(title)) {
      return res.status(400).json({ message: 'Task title must be unique and not match column names.' });
    }

    const task = new Task({
      title,
      description,
      assignedUser,
      status: status || 'Todo',
      priority: priority || 'Low',
      updatedBy: req.user._id
    });

    const savedTask = await task.save();

    await logAction('create', req.user._id, savedTask._id, `${req.user.username} created task "${savedTask.title}"`);

    io.emit('taskUpdated', savedTask);
    io.emit('logUpdated');

    res.status(201).json(savedTask);
  } catch (err) {
    res.status(500).json({ message: 'Failed to create task', error: err.message });
  }
};
export const updateTask = async (req, res) => {
  const { taskId } = req.params;
  const { title, description, priority, status, assignedUser } = req.body;

  try {
    const task = await Task.findById(taskId);
    if (!task) return res.status(404).json({ message: 'Task not found' });

    if (title !== undefined) task.title = title;
    if (description !== undefined) task.description = description;
    if (priority !== undefined) task.priority = priority;
    if (status !== undefined) task.status = status;
    if (assignedUser !== undefined) task.assignedUser = assignedUser;

    task.lastUpdated = new Date();
    task.updatedBy = req.user._id;

    const updatedTask = await task.save();
    const populatedTask = await updatedTask.populate('assignedUser', 'username');

    await logAction('Update', req.user._id, taskId, `${req.user.username} updated task "${task.title}"`);

    io.emit('taskUpdated', populatedTask);
    io.emit('logUpdated');

    res.status(200).json(populatedTask);

  } catch (err) {
    res.status(500).json({ message: 'Failed to update task', error: err.message });
  }
};



export const deleteTask = async (req, res) => {
  const { taskId } = req.params;

  try {
    const task = await Task.findByIdAndDelete(taskId);
    if (!task) return res.status(404).json({ message: 'Task not found' });

    await logAction('delete', req.user._id, taskId, `${req.user.username} deleted task "${task.title}"`);

    io.emit('taskUpdated', { _id: taskId, deleted: true });
    io.emit('logUpdated');

    res.status(200).json({ message: 'Task deleted' });
  } catch (err) {
    res.status(500).json({ message: 'Failed to delete task', error: err.message });
    console.log(err)
  }
};

export const smartAssignTask = async (req, res) => {
  try {
    const taskId = req.params.taskId;

    const users = await User.find({});
    const tasks = await Task.find({ status: { $in: ['Todo', 'In Progress'] } });

    const taskCounts = users.map(user => ({
      userId: user._id,
      username: user.username,
      count: tasks.filter(task => task.assignedUser?.toString() === user._id.toString()).length
    }));

    const minTasks = Math.min(...taskCounts.map(u => u.count));
    const candidates = taskCounts.filter(u => u.count === minTasks);

    const selected = candidates[Math.floor(Math.random() * candidates.length)];

    const updatedTask = await Task.findByIdAndUpdate(
      taskId,
      { assignedUser: selected.userId },
      { new: true }
    ).populate('assignedUser', 'username');

    await logAction('Smart Assign', req.user._id, taskId, `${req.user.username} used Smart Assign`);

    io.emit('taskUpdated', updatedTask);
    io.emit('logUpdated');

    res.status(200).json(updatedTask);
  } catch (err) {
    res.status(500).json({ message: 'Smart Assign failed', error: err.message });
  }
};
