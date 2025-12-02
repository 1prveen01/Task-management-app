

import api from "../axios.js"

// -----------------------------
// REGISTER USER
// -----------------------------
export const registerUser = async (formData) => {
  const res = await api.post("/users/register", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return res.data.data;
};

// -----------------------------
// LOGIN USER
// -----------------------------
export const loginUser = async (credentials) => {
  const res = await api.post("/users/login", credentials);
  return res.data.data;
};

// -----------------------------
// REFRESH ACCESS TOKEN
// -----------------------------
export const refreshAccessToken = async () => {
  const res = await api.post("/users/refresh-token");
  return res.data.data;
};

// -----------------------------
// LOGOUT USER
// -----------------------------
export const logoutUser = async () => {
  const res = await api.post("/users/logout");
  return res.data.message;
};

// -----------------------------
// CHANGE PASSWORD
// -----------------------------
export const changePassword = async (data) => {
  const res = await api.post("/users/change-password", data);
  return res.data.message;
};

// -----------------------------
// GET CURRENT USER
// -----------------------------
export const getCurrentUser = async () => {
  const res = await api.get("/users/current-user");
  return res.data.data;
};

// -----------------------------
// UPDATE USER ACCOUNT DETAILS
// -----------------------------
export const updateAccountDetails = async (updates) => {
  const res = await api.patch("/users/update-account", updates);
  return res.data.data;
};

// -----------------------------
// UPDATE USER AVATAR
// -----------------------------
export const updateUserAvatar = async (file) => {
  const formData = new FormData();
  formData.append("avatar", file);

  const res = await api.patch("/users/avatar", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });

  return res.data.data;
};
