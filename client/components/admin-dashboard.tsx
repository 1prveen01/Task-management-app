"use client";

import { useAuth } from "@/lib/context/auth-context";
import { useState } from "react";
import { Task, Status, Priority, statusColors, priorityColors } from "@/types/task";
import { User } from "../types/user"
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Plus, Pencil, Trash2, Users, CheckCircle2, Clock, AlertCircle, Loader2 } from "lucide-react";

export function AdminDashboard() {
  const { tasks, users, createTask, updateTask, deleteTask, deleteUser, loading } = useAuth();

  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [newTask, setNewTask] = useState<Partial<Task>>({
    title: "",
    description: "",
    status: "pending",
    priority: "medium",
    assignedTo: "",
    dueDate: "",
  });

  const taskList: Task[] = Array.isArray(tasks) 
    ? tasks.map(task => {
        // If assignedTo is a populated user object, extract just the ID
        const assignedToId = typeof task.assignedTo === 'object' && task.assignedTo !== null
          ? (task.assignedTo as any)._id || (task.assignedTo as any).id
          : task.assignedTo || "";
        
        return {
          ...task,
          assignedTo: assignedToId
        } as Task;
      })
    : [];
    
  const userList: User[] = Array.isArray(users) ? users : [];

  const stats = {
    totalTasks: taskList.length,
    completedTasks: taskList.filter((t) => t.status === "completed").length,
    inProgressTasks: taskList.filter((t) => t.status === "in-progress").length,
    pendingTasks: taskList.filter((t) => t.status === "pending").length,
    totalUsers: userList.filter((u) => u.role === "user").length,
  };

  const handleCreateTask = async () => {
    if (newTask.title && newTask.description) {
      try {
        setIsSubmitting(true);
        console.log("Creating task with data:", newTask);
        await createTask(newTask as Task);
        console.log("Task created successfully");
        setNewTask({ title: "", description: "", status: "pending", priority: "medium", assignedTo: "", dueDate: "" });
        setIsCreateOpen(false);
      } catch (error) {
        console.error("Failed to create task:", error);
        alert("Failed to create task.");
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  const handleUpdateTask = async () => {
    if (editingTask) {
      try {
        setIsSubmitting(true);
        console.log("Updating task with data:", editingTask);
        await updateTask(editingTask._id || editingTask.id!, editingTask);
        console.log("Task updated successfully");
        setIsEditOpen(false);
        setEditingTask(null);
      } catch (error) {
        console.error("Failed to update task:", error);
        alert("Failed to update task.");
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  const handleDeleteTask = async (id: string) => {
    if (confirm("Are you sure you want to delete this task?")) {
      try {
        await deleteTask(id);
      } catch (error) {
        console.error(error);
        alert("Failed to delete task.");
      }
    }
  };

  const handleDeleteUser = async (id: string) => {
    if (confirm("Are you sure you want to delete this user?")) {
      try {
        await deleteUser(id);
      } catch (error) {
        console.error(error);
        alert("Failed to delete user.");
      }
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto p-6 flex items-center justify-center min-h-[400px]">
        <div className="text-center space-y-4">
          <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary" />
          <p className="text-muted-foreground">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Dashboard Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Admin Dashboard</h1>
          <p className="text-muted-foreground">Manage tasks and users</p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Tasks</CardTitle>
            <AlertCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalTasks}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex justify-between pb-2">
            <CardTitle className="text-sm font-medium">Completed</CardTitle>
            <CheckCircle2 className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.completedTasks}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex justify-between pb-2">
            <CardTitle className="text-sm font-medium">In Progress</CardTitle>
            <Clock className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.inProgressTasks}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalUsers}</div>
          </CardContent>
        </Card>
      </div>

      {/* Tasks Table */}
      <Card>
        <CardHeader className="flex justify-between">
          <div>
            <CardTitle>Tasks</CardTitle>
            <CardDescription>Manage all tasks</CardDescription>
          </div>
          <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" /> Create Task
              </Button>
            </DialogTrigger>
            <DialogContent className="max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Create Task</DialogTitle>
                <DialogDescription>Add a new task</DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="title">Title</Label>
                  <Input
                    id="title"
                    value={newTask.title || ""}
                    onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={newTask.description || ""}
                    onChange={(e) => setNewTask({ ...newTask, description: e.target.value })}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Status</Label>
                    <Select
                      value={newTask.status}
                      onValueChange={(value: Status) => setNewTask({ ...newTask, status: value })}
                    >
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="pending">Pending</SelectItem>
                        <SelectItem value="in-progress">In Progress</SelectItem>
                        <SelectItem value="completed">Completed</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Priority</Label>
                    <Select
                      value={newTask.priority}
                      onValueChange={(value: Priority) => setNewTask({ ...newTask, priority: value })}
                    >
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="low">Low</SelectItem>
                        <SelectItem value="medium">Medium</SelectItem>
                        <SelectItem value="high">High</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Assign To</Label>
                  <Select
                    value={newTask.assignedTo || "unassigned"}
                    onValueChange={(value) => {
                      console.log("Selected user:", value);
                      setNewTask({ ...newTask, assignedTo: value === "unassigned" ? "" : value });
                    }}
                  >
                    <SelectTrigger><SelectValue placeholder="Select user" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="unassigned">Unassigned</SelectItem>
                      {userList.filter(u => u.role === "user").map((user) => {
                        const userId = user._id || user.id;
                        console.log("User:", user.fullName, "ID:", userId);
                        return (
                          <SelectItem key={userId} value={userId!}>
                            {user.fullName}
                          </SelectItem>
                        );
                      })}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="dueDate">Due Date</Label>
                  <Input
                    id="dueDate"
                    type="date"
                    value={newTask.dueDate ? new Date(newTask.dueDate).toISOString().split('T')[0] : ""}
                    onChange={(e) => setNewTask({ ...newTask, dueDate: e.target.value })}
                  />
                </div>
                <Button onClick={handleCreateTask} className="w-full" disabled={isSubmitting}>
                  {isSubmitting ? "Creating..." : "Create Task"}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Title</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Priority</TableHead>
                <TableHead>Assigned To</TableHead>
                <TableHead>Due Date</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {taskList.map((task) => (
                <TableRow key={task._id || task.id}>
                  <TableCell>{task.title}</TableCell>
                  <TableCell>
                    <Badge variant="outline" className={statusColors[task.status]}>
                      {task.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className={priorityColors[task.priority]}>
                      {task.priority}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {(() => {
                      console.log("Task assignedTo:", task.assignedTo, "Available users:", userList.map(u => ({ id: u._id || u.id, name: u.fullName })));
                      if (!task.assignedTo) return "Unassigned";
                      
                      // Handle if assignedTo is populated with user object or just an ID
                      const assignedToId = typeof task.assignedTo === 'string' 
                        ? task.assignedTo 
                        : (task.assignedTo as any)?._id || (task.assignedTo as any)?.id;
                      
                      // If assignedTo is already the full user object, return the name directly
                      if (typeof task.assignedTo === 'object' && (task.assignedTo as any).fullName) {
                        return (task.assignedTo as any).fullName;
                      }
                      
                      // Otherwise, find the user by ID
                      const assignedUser = userList.find((u) => 
                        (u._id === assignedToId) || (u.id === assignedToId)
                      );
                      return assignedUser?.fullName || "Unassigned";
                    })()}
                  </TableCell>
                  <TableCell>
                    {task.dueDate ? new Date(task.dueDate).toLocaleDateString() : "-"}
                  </TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="icon" onClick={() => { setEditingTask(task); setIsEditOpen(true); }}>
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => handleDeleteTask(task._id || task.id!)}>
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Users Table */}
      <Card>
        <CardHeader>
          <CardTitle>Users</CardTitle>
          <CardDescription>Manage users</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Role</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {userList.map((user) => (
                <TableRow key={user._id || user.id}>
                  <TableCell>{user.fullName}</TableCell>
                  <TableCell>{user.email}</TableCell>
                  <TableCell>
                    <Badge variant={user.role === "admin" ? "default" : "secondary"}>{user.role}</Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    {user.role !== "admin" && (
                      <Button variant="ghost" size="icon" onClick={() => handleDeleteUser(user._id || user.id!)}>
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Edit Task Dialog */}
      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent className="max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Task</DialogTitle>
            <DialogDescription>Update task details</DialogDescription>
          </DialogHeader>
          {editingTask && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="edit-title">Title</Label>
                <Input
                  id="edit-title"
                  value={editingTask.title}
                  onChange={(e) => setEditingTask({ ...editingTask, title: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-description">Description</Label>
                <Textarea
                  id="edit-description"
                  value={editingTask.description}
                  onChange={(e) => setEditingTask({ ...editingTask, description: e.target.value })}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Status</Label>
                  <Select
                    value={editingTask.status}
                    onValueChange={(value: Status) => setEditingTask({ ...editingTask, status: value })}
                  >
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="in-progress">In Progress</SelectItem>
                      <SelectItem value="completed">Completed</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Priority</Label>
                  <Select
                    value={editingTask.priority}
                    onValueChange={(value: Priority) => setEditingTask({ ...editingTask, priority: value })}
                  >
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">Low</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="high">High</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-2">
                <Label>Assign To</Label>
                <Select
                  value={editingTask.assignedTo || "unassigned"}
                  onValueChange={(value) => {
                    console.log("Edit - Selected user:", value);
                    setEditingTask({ ...editingTask, assignedTo: value === "unassigned" ? "" : value });
                  }}
                >
                  <SelectTrigger><SelectValue placeholder="Select user" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="unassigned">Unassigned</SelectItem>
                    {userList.filter(u => u.role === "user").map((user) => {
                      const userId = user._id || user.id;
                      return (
                        <SelectItem key={userId} value={userId!}>
                          {user.fullName}
                        </SelectItem>
                      );
                    })}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-dueDate">Due Date</Label>
                <Input
                  id="edit-dueDate"
                  type="date"
                  value={editingTask.dueDate ? new Date(editingTask.dueDate).toISOString().split('T')[0] : ""}
                  onChange={(e) => setEditingTask({ ...editingTask, dueDate: e.target.value })}
                />
              </div>
              <Button onClick={handleUpdateTask} className="w-full" disabled={isSubmitting}>
                {isSubmitting ? "Updating..." : "Update Task"}
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}