export interface User {
  _id?: string;
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'user';
}

export interface AuthState {
  token: string | null;
  user: User | null;
}

export interface Task {
  _id: string;
  title: string;
  status: 'todo' | 'in-progress' | 'done';
  assignedTo: User;
  createdAt: string;
  updatedAt: string;
}

export interface CreateTaskPayload {
  title: string;
  assignedTo: string;
}

export interface UpdateTaskStatusPayload {
  status: 'todo' | 'in-progress' | 'done';
}

export interface LoginPayload {
  email: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  user: User;
}

export interface Toast {
  id: string;
  message: string;
  type: 'success' | 'error' | 'info';
}