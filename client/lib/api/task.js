// 
import api from "../axios.js"
// -------------------------
// ADMIN ROUTES
// -------------------------

export const createTask = async (taskData) => {
  const res = await api.post("/tasks/create-task", taskData);
  return res.data.data;
};

export const getAllTasks = async () => {
  const res = await api.get("/tasks/get-all-tasks");
  return res.data.data;
};

export const deleteTask = async (id) => {
  const res = await api.delete(`/tasks/delete-task/${id}`);
  return res.data.data;
};

export const getAdminTaskStats = async () => {
  const res = await api.get("/tasks/task-stats-for-admin");
  return res.data.data;
};

// -------------------------
// USER ROUTES
// -------------------------

export const getMyTasks = async () => {
  const res = await api.get("/tasks/my-task");
  return res.data.data;
};

export const getUserTaskStats = async () => {
  const res = await api.get("/tasks/task-stats-for-user");
  return res.data.data;
};

// -------------------------
// SHARED ROUTES
// -------------------------

export const getTaskById = async (id) => {
  const res = await api.get(`/tasks/get-task-by-id/${id}`);
  return res.data.data;
};

export const updateTask = async (id, updates) => {
  const res = await api.patch(`/tasks/update-task/${id}`, updates);
  return res.data.data;
};
