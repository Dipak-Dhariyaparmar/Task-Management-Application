import { Response } from 'express';
import mongoose from 'mongoose';
import Task from '../models/Task';
import User from '../models/User';
import { AuthRequest } from '../middleware/auth.middleware';
import { io } from '../socket/socket';

export const createTask = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { title, assignedTo } = req.body;

    if (!title || !assignedTo) {
      res.status(400).json({ message: 'Title and assignedTo are required' });
      return;
    }

    if (!mongoose.Types.ObjectId.isValid(assignedTo)) {
      res.status(400).json({ message: 'assignedTo must be a valid user id' });
      return;
    }

    const user = await User.findById(assignedTo);
    if (!user) {
      res.status(404).json({ message: 'User not found' });
      return;
    }

    const task = new Task({
      title,
      status: 'todo',
      assignedTo,
    });

    await task.save();
    await task.populate('assignedTo', 'name email role');

    io.to(`user:${assignedTo}`).emit('task:assigned', {
      taskId: task._id,
      title: task.title,
      assignedTo,
    });

    res.status(201).json(task);
  } catch (error) {
    console.error('Create task error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const getTasks = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ message: 'Unauthorized' });
      return;
    }

    let tasks;

    if (req.user.role === 'admin') {
      tasks = await Task.find().populate('assignedTo', 'name email role').sort({ createdAt: -1 });
    } else {
      tasks = await Task.find({ assignedTo: req.user.id }).populate('assignedTo', 'name email role').sort({ createdAt: -1 });
    }

    res.json(tasks);
  } catch (error) {
    console.error('Get tasks error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const updateTaskStatus = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!status || !['todo', 'in-progress', 'done'].includes(status)) {
      res.status(400).json({ message: 'Invalid status' });
      return;
    }

    if (!req.user) {
      res.status(401).json({ message: 'Unauthorized' });
      return;
    }

    const task = await Task.findById(id);
    if (!task) {
      res.status(404).json({ message: 'Task not found' });
      return;
    }

    if (task.assignedTo.toString() !== req.user.id) {
      res.status(403).json({ message: 'You can only update your assigned tasks' });
      return;
    }

    task.status = status;
    task.updatedAt = new Date();
    await task.save();
    await task.populate('assignedTo', 'name email role');

    res.json(task);
  } catch (error) {
    console.error('Update task error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const getUsers = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const users = await User.find({ role: 'user' }, 'name email role').lean();
    res.json(users.map((user) => ({
      id: user._id.toString(),
      name: user.name,
      email: user.email,
      role: user.role,
    })));
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};