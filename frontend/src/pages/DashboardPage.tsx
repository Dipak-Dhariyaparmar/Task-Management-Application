import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../utils/api';
import { initSocket, getSocket } from '../utils/socket';
import { Task, User } from '../types';
import { useToast } from '../context/ToastContext';

const DashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [user, setUser] = useState<User | null>(null);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState('');
  const [newTaskTitle, setNewTaskTitle] = useState('');

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    const token = localStorage.getItem('token');

    if (!storedUser || !token) {
      navigate('/login');
      return;
    }

    const parsedUser = JSON.parse(storedUser) as User;
    setUser(parsedUser);

    initSocket(token);

    fetchTasks();
    if (parsedUser.role === 'admin') {
      fetchUsers();
    }

    const socket = getSocket();
    if (socket) {
      socket.emit('join', parsedUser.id);
      socket.on('task:assigned', (data: any) => {
        showToast(`New task assigned: ${data.title}`, 'info');
        fetchTasks();
      });
    }

    return () => {
      if (socket) {
        socket.off('task:assigned');
      }
    };
  }, [navigate, showToast]);

  const fetchTasks = async () => {
    try {
      const response = await api.get<Task[]>('/api/tasks');
      setTasks(response.data);
    } catch (error) {
      showToast('Failed to fetch tasks', 'error');
      console.error('Fetch tasks error:', error);
    }
  };

  const fetchUsers = async () => {
    try {
      const response = await api.get<User[]>('/api/tasks/all/users');
      setUsers(response.data);
    } catch (error) {
      console.error('Fetch users error:', error);
    }
  };

  const handleCreateTask = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!newTaskTitle || !selectedUserId) {
      showToast('Please fill all fields', 'error');
      return;
    }

    setLoading(true);

    try {
      await api.post('/api/tasks', {
        title: newTaskTitle,
        assignedTo: selectedUserId,
      });

      showToast('Task created successfully!', 'success');
      setNewTaskTitle('');
      setSelectedUserId('');
      await fetchTasks();
    } catch (error) {
      showToast('Failed to create task', 'error');
      console.error('Create task error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateTaskStatus = async (taskId: string, newStatus: 'todo' | 'in-progress' | 'done') => {
    try {
      await api.patch(`/api/tasks/${taskId}/status`, { status: newStatus });
      showToast('Task status updated', 'success');
      await fetchTasks();
    } catch (error) {
      showToast('Failed to update task status', 'error');
      console.error('Update task error:', error);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  const getUserId = (taskUser: User) => taskUser.id || taskUser._id;

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 py-6 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-800">Task Manager</h1>
            <p className="text-gray-600">Welcome, {user.name} ({user.role})</p>
          </div>
          <button
            onClick={handleLogout}
            className="bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-4 rounded-lg transition"
          >
            Logout
          </button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8">
        {user.role === 'admin' && (
          <div className="bg-white rounded-lg shadow-md p-6 mb-8">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">Create Task</h2>
            <form onSubmit={handleCreateTask} className="flex gap-4 flex-col md:flex-row">
              <input
                type="text"
                value={newTaskTitle}
                onChange={(e) => setNewTaskTitle(e.target.value)}
                placeholder="Enter task title"
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
              />
              <select
                value={selectedUserId}
                onChange={(e) => setSelectedUserId(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
              >
                <option value="">Select user</option>
                {users.map((u) => (
                  <option key={u.id} value={u.id}>
                    {u.name}
                  </option>
                ))}
              </select>
              <button
                type="submit"
                disabled={loading}
                className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-6 rounded-lg transition disabled:bg-gray-400"
              >
                {loading ? 'Creating...' : 'Create'}
              </button>
            </form>
          </div>
        )}

        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-2xl font-bold text-gray-800">
              {user.role === 'admin' ? 'All Tasks' : 'My Tasks'}
            </h2>
          </div>

          {tasks.length === 0 ? (
            <div className="p-6 text-center text-gray-500">
              No tasks available
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">Title</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">Assigned To</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">Created</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {tasks.map((task) => (
                    <tr key={task._id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 text-gray-800 font-medium">{task.title}</td>
                      <td className="px-6 py-4 text-gray-600">{task.assignedTo.name}</td>
                      <td className="px-6 py-4">
                        {user.role === 'user' ? (
                          <select
                            value={task.status}
                            onChange={(e) =>
                              handleUpdateTaskStatus(
                                task._id,
                                e.target.value as 'todo' | 'in-progress' | 'done'
                              )
                            }
                            disabled={getUserId(task.assignedTo) !== user.id}
                            className={`px-3 py-1 rounded-full text-sm font-semibold border-0 focus:outline-none cursor-pointer ${
                              task.status === 'todo'
                                ? 'bg-yellow-100 text-yellow-800'
                                : task.status === 'in-progress'
                                ? 'bg-blue-100 text-blue-800'
                                : 'bg-green-100 text-green-800'
                            }`}
                          >
                            <option value="todo">Todo</option>
                            <option value="in-progress">In Progress</option>
                            <option value="done">Done</option>
                          </select>
                        ) : (
                          <span
                            className={`px-3 py-1 rounded-full text-sm font-semibold ${
                              task.status === 'todo'
                                ? 'bg-yellow-100 text-yellow-800'
                                : task.status === 'in-progress'
                                ? 'bg-blue-100 text-blue-800'
                                : 'bg-green-100 text-green-800'
                            }`}
                          >
                            {task.status === 'in-progress' ? 'In Progress' : task.status === 'todo' ? 'Todo' : 'Done'}
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-gray-600 text-sm">
                        {new Date(task.createdAt).toLocaleDateString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default DashboardPage;