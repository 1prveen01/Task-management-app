// /types/task.ts

export const statusColors = {
  pending: "bg-gray-500/10 text-gray-500 border-gray-500/20",
  "in-progress": "bg-blue-500/10 text-blue-500 border-blue-500/20",
  completed: "bg-green-500/10 text-green-500 border-green-500/20",
} as const;

export const priorityColors = {
  low: "bg-blue-500/10 text-blue-500 border-blue-500/20",
  medium: "bg-yellow-500/10 text-yellow-500 border-yellow-500/20",
  high: "bg-red-500/10 text-red-500 border-red-500/20",
} as const;

export type Status = keyof typeof statusColors; // "pending" | "in-progress" | "completed"
export type Priority = keyof typeof priorityColors; // "low" | "medium" | "high"

export interface Task {
  _id?: string;
  id?: string;
  title: string;
  description: string;
  status: Status;
  priority: Priority;
  assignedTo: string;
  dueDate: string;
}
