import mongoose from 'mongoose';

const actionLogSchema = new mongoose.Schema({
  actionType: String,
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  taskId: { type: mongoose.Schema.Types.ObjectId, ref: 'Task' },
  description: String,
  timestamp: { type: Date, default: Date.now }
});

const ActionLog = mongoose.model('ActionLog', actionLogSchema);
export default ActionLog;
