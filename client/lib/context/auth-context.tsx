"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import axios from "axios";
import { updateAccountDetails, updateUserAvatar, changePassword } from "../api/user";

const API = "http://localhost:8000/api/v1";

// ====== Types ======
export type TaskStatus = "pending" | "in-progress" | "completed";
export type TaskPriority = "low" | "medium" | "high";

export interface Task {
  id: string;
  _id?: string;
  title: string;
  description: string;
  status: TaskStatus;
  priority: TaskPriority;
  assignedTo?: string;
  dueDate?: string;
}

export interface User {
  id: string;
  _id?: string;
  fullName: string;
  email: string;
  role: "admin" | "user";
  avatar?: string;
}

interface AuthContextType {
  user: User | null;
  tasks: Task[];
  users: User[];
  loading: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  register: (data: any) => Promise<User>;
  logout: () => void;
  fetchTasks: () => Promise<void>;
  fetchUsers: () => Promise<void>;
  createTask: (taskData: Partial<Task>) => Promise<void>;
  updateTask: (taskId: string, updates: Partial<Task>) => Promise<void>;
  deleteTask: (taskId: string) => Promise<void>;
  deleteUser: (userId: string) => Promise<void>;
  updateProfile: (data: any) => Promise<User>;
  updateAvatar: (file: any) => Promise<User>;
  updateChangePassword: (data: any) => Promise<string>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  // ===== Helper functions =====
  const fetchAllTasksWithToken = async (token: string) => {
    try {
      const res = await axios.get(`${API}/tasks/get-all-tasks`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setTasks(res.data.data);
    } catch (err) {
      console.error("Error fetching all tasks:", err);
      setTasks([]);
    }
  };

  const fetchMyTasksWithToken = async (token: string) => {
    try {
      const res = await axios.get(`${API}/tasks/my-task`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setTasks(res.data.data);
    } catch (err) {
      console.error("Error fetching my tasks:", err);
      setTasks([]);
    }
  };

  const fetchUsersWithToken = async (token: string) => {
    try {
      const res = await axios.get(`${API}/admin/get-all-users`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setUsers(res.data.data);
    } catch (err) {
      console.error("Error fetching users:", err);
      setUsers([]);
    }
  };

  const fetchTasks = async () => {
    const token = localStorage.getItem("token");
    if (!token || !user) return;

    if (user.role === "admin") {
      await fetchAllTasksWithToken(token);
    } else {
      await fetchMyTasksWithToken(token);
    }
  };

  const fetchUsers = async () => {
    const token = localStorage.getItem("token");
    if (!token || user?.role !== "admin") return;
    await fetchUsersWithToken(token);
  };

  // ===== Load user on mount =====
  useEffect(() => {
    const loadUser = async () => {
      const token = localStorage.getItem("token");
      if (!token) {
        setLoading(false);
        return;
      }

      try {
        const res = await axios.get(`${API}/users/current-user`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const userData: User = res.data.data;
        setUser(userData);

        if (userData.role === "admin") {
          await Promise.all([fetchAllTasksWithToken(token), fetchUsersWithToken(token)]);
        } else {
          await fetchMyTasksWithToken(token);
        }
      } catch (err) {
        console.error("Error loading user:", err);
        localStorage.removeItem("token");
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    loadUser();
  }, []);

  // ===== Auth functions =====
  const login = async (email: string, password: string) => {
    try {
      const res = await axios.post(`${API}/users/login`, { email, password });
      const token = res.data.data.accessToken;
      const userData: User = res.data.data.user;

      localStorage.setItem("token", token);
      setUser(userData);
      setLoading(false);

      if (userData.role === "admin") {
        await Promise.all([fetchAllTasksWithToken(token), fetchUsersWithToken(token)]);
      } else {
        await fetchMyTasksWithToken(token);
      }

      return true;
    } catch (err) {
      console.error("Login error:", err);
      throw err;
    }
  };

  const register = async (data: any) => {
    const res = await axios.post(`${API}/users/register`, data);
    return res.data.data as User;
  };

  const logout = () => {
    localStorage.removeItem("token");
    setUser(null);
    setTasks([]);
    setUsers([]);
  };

  const createTask = async (taskData: Partial<Task>) => {
    const token = localStorage.getItem("token");
    if (!token) throw new Error("No token found");

    await axios.post(`${API}/tasks/create-task`, taskData, {
      headers: { Authorization: `Bearer ${token}` },
    });

    await fetchTasks();
  };

  const updateTask = async (taskId: string, updates: Partial<Task>) => {
    const token = localStorage.getItem("token");
    if (!token) throw new Error("No token found");

    await axios.patch(`${API}/tasks/update-task/${taskId}`, updates, {
      headers: { Authorization: `Bearer ${token}` },
    });

    await fetchTasks();
  };

  const deleteTask = async (taskId: string) => {
    const token = localStorage.getItem("token");
    if (!token) throw new Error("No token found");

    await axios.delete(`${API}/tasks/delete-task/${taskId}`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    await fetchTasks();
  };

  const deleteUser = async (userId: string) => {
    const token = localStorage.getItem("token");
    if (!token) throw new Error("No token found");

    await axios.delete(`${API}/admin/delete-user/${userId}`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    await fetchUsers();
  };

  const updateProfile = async (data: any) => {
    const updatedUser = await updateAccountDetails(data);
    setUser(updatedUser);
    return updatedUser;
  };

  const updateAvatar = async (file: any) => {
    const updatedUser = await updateUserAvatar(file);
    setUser(updatedUser);
    return updatedUser;
  };

  const updateChangePassword = async (data: any) => {
    const msg = await changePassword(data);
    return msg;
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        tasks,
        users,
        loading,
        login,
        register,
        logout,
        fetchTasks,
        fetchUsers,
        createTask,
        updateTask,
        deleteTask,
        deleteUser,
        updateProfile,
        updateAvatar,
        updateChangePassword,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within AuthProvider");
  return context;
};
