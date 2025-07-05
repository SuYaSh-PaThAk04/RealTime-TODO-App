import ActionLog from '../models/ActionLog.Model.js';

export const getRecentLogs = async (req, res) => {
  try {
    const logs = await ActionLog.find()
      .sort({ timestamp: -1 })
      .limit(20)
      .populate('user', 'username email')
      .populate('taskId', 'title');

    res.json(logs);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch logs', error: err.message });
  }
};
