export interface User {
  _id?: string;
  id?: string;
  fullName: string;
  email: string;
  role: "user" | "admin";
}
