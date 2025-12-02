import api from "./api"; 

// -----------------------------
// GET ALL USERS  (Admin Only)
// -----------------------------
export const getAllUsers = async () => {
  const res = await api.get("/admin/get-all-users");
  return res.data.data;
};

// -----------------------------
// DELETE USER BY ID (Admin Only)
// -----------------------------
export const deleteUser = async (userId) => {
  const res = await api.delete(`/admin/delete-user/${userId}`);
  return res.data.data;
};

// -----------------------------
// CHECK IF ADMIN ACCESS WORKS
// (Optional)
// -----------------------------
export const adminOnlyTest = async () => {
  const res = await api.get("/admin/admin-only");
  return res.data;
};
