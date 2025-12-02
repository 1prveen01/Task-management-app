"use client";

import { createContext, useContext, useState, useEffect } from "react";
import axios, { AxiosResponse } from "axios";
import { updateAccountDetails , updateUserAvatar , changePassword } from "../api/user";
const AuthContext = createContext<any>(null);

const API = "http://localhost:8000/api/v1";

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<any>(null);
  const [tasks, setTasks] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Load user on refresh
  useEffect(() => {
    console.log("🔄 AuthContext: useEffect triggered");
    const token = localStorage.getItem("token");
    console.log("🔑 Token found:", !!token);
    
    if (!token) {
      console.log("❌ No token, setting loading to false");
      setLoading(false);
      return;
    }

    console.log("✅ Token exists, fetching user...");
    axios
      .get(`${API}/users/current-user`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => {
        const userData = res.data.data;
        setUser(userData);
        
        // Fetch tasks based on role
        if (userData.role === "admin") {
          console.log("👑 Admin user, fetching all tasks and users");
          return Promise.all([
            fetchAllTasksWithToken(token),
            fetchUsersWithToken(token)
          ]);
        } else {
          console.log("👤 Regular user, fetching my tasks");
          return fetchMyTasksWithToken(token);
        }
      })
      .catch((error) => {
        console.error("❌ Error loading user:", error);
        localStorage.removeItem("token");
        setUser(null);
      })
      .finally(() => {
        console.log("✅ Loading complete, setting loading to false");
        setLoading(false);
      });
  }, []);

  // LOGIN
  const login = async (email: string, password: string) => {
    try {
      console.log("🔐 Attempting login...");
      const res = await axios.post(`${API}/users/login`, { email, password });

      const token = res.data.data.accessToken;
      const userData = res.data.data.user;

     

      localStorage.setItem("token", token);
      setUser(userData);
      setLoading(false);

      // Fetch data based on role
      if (userData.role === "admin") {
        console.log("👑 Fetching admin data");
        await Promise.all([
          fetchAllTasksWithToken(token),
          fetchUsersWithToken(token)
        ]);
      } else {
        console.log("👤 Fetching user data");
        await fetchMyTasksWithToken(token);
      }

      console.log("✅ Login flow complete");
      return true;
    } catch (error) {
      console.error("❌ Login error:", error);
      throw error;
    }
  };

  // REGISTER
  const register = async (data: any) => {
    const res = await axios.post(`${API}/users/register`, data);
    return res.data.data;
  };

  // LOGOUT
  const logout = () => {
    console.log("👋 Logging out");
    localStorage.removeItem("token");
    setUser(null);
    setTasks([]);
    setUsers([]);
  };

  // Helper: Fetch ALL tasks (Admin)
  const fetchAllTasksWithToken = async (token: string) => {
    try {
      const res = await axios.get(`${API}/tasks/get-all-tasks`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      console.log("📋 All tasks fetched:", res.data.data.length);
      setTasks(res.data.data);
    } catch (error) {
      console.error("❌ Error fetching all tasks:", error);
      setTasks([]);
    }
  };

  // Helper: Fetch MY tasks (User)
  const fetchMyTasksWithToken = async (token: string) => {
    try {
      const res = await axios.get(`${API}/tasks/my-task`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      console.log("📋 My tasks fetched:", res.data.data.length);
      setTasks(res.data.data);
    } catch (error) {
      console.error("❌ Error fetching my tasks:", error);
      setTasks([]);
    }
  };

  // Helper: Fetch users (Admin only)
  const fetchUsersWithToken = async (token: string) => {
    try {
      const res = await axios.get(`${API}/admin/get-all-users`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      console.log("👥 Users fetched:", res.data.data.length);
      setUsers(res.data.data);
    } catch (error) {
      console.error("❌ Error fetching users:", error);
      setUsers([]);
    }
  };

  // FETCH TASKS (public wrapper)
  const fetchTasks = async () => {
    const token = localStorage.getItem("token");
    if (!token || !user) return;

    if (user.role === "admin") {
      await fetchAllTasksWithToken(token);
    } else {
      await fetchMyTasksWithToken(token);
    }
  };

  // FETCH USERS (Admin only)
  const fetchUsers = async () => {
    const token = localStorage.getItem("token");
    if (!token || user?.role !== "admin") return;
    await fetchUsersWithToken(token);
  };

 // CREATE TASK (Admin only)
const createTask = async (taskData: any) => {
  const token = localStorage.getItem("token");
  if (!token) throw new Error("No token found");

  try {
  
    
    const res = await axios.post(`${API}/tasks/create-task`, taskData, {
      headers: { Authorization: `Bearer ${token}` },
    });
    
    console.log("✅ Task created successfully:", res.data);
    await fetchTasks();
  } catch (error: any) {
    throw error;
  }
};

  // UPDATE TASK
  const updateTask = async (taskId: string, updates: any) => {
    const token = localStorage.getItem("token");
    if (!token) throw new Error("No token found");

    try {
      await axios.patch(`${API}/tasks/update-task/${taskId}`, updates, {
        headers: { Authorization: `Bearer ${token}` },
      });
      await fetchTasks();
    } catch (error) {
      console.error("Error updating task:", error);
      throw error;
    }
  };

  // DELETE TASK (Admin only)
  const deleteTask = async (taskId: string) => {
    const token = localStorage.getItem("token");
    if (!token) throw new Error("No token found");

    try {
      await axios.delete(`${API}/tasks/delete-task/${taskId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      await fetchTasks();
    } catch (error) {
      console.error("Error deleting task:", error);
      throw error;
    }
  };

  // DELETE USER (Admin only)
  const deleteUser = async (userId: string) => {
    const token = localStorage.getItem("token");
    if (!token) throw new Error("No token found");

    try {
      await axios.delete(`${API}/admin/delete-user/${userId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      await fetchUsers();
    } catch (error) {
      console.error("Error deleting user:", error);
      throw error;
    }
  };

  const updateProfile = async (data:any) => {
  try {
    const updatedUser = await updateAccountDetails(data);
    setUser(updatedUser);
    return updatedUser;
  } catch (err) {
    console.error("Error updating account:", err);
    throw err;
  }
};

const updateAvatar = async (file:any) => {
  try {
    const updatedUser = await updateUserAvatar(file);
    setUser(updatedUser);
    return updatedUser;
  } catch (err) {
    console.error("Error updating avatar:", err);
    throw err;
  }
};


const updateChangePassword = async (data:any) => {
  try {
    const msg = await changePassword(data);
    return msg; // e.g. "Password updated successfully"
  } catch (err) {
    console.error("Password change failed:", err);
    throw err;
  }
};



  console.log("🎯 AuthContext render - user:", user, "loading:", loading);

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        tasks,
        users,
        login,
        register,
        logout,
        createTask,
        updateTask,
        deleteTask,
        deleteUser,
        fetchTasks,
        fetchUsers,
        updateProfile,
        updateAvatar,
        updateChangePassword
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);