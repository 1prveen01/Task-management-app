"use client"

import { useAuth } from "@/lib/context/auth-context"
import { Task, Status, Priority, statusColors, priorityColors } from "@/types/task"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { CheckCircle2, Clock, AlertCircle, Calendar } from "lucide-react"

export function UserDashboard() {
  const { user, tasks, updateTask } = useAuth()

  const myTasks: Task[] = Array.isArray(tasks)
    ? tasks.filter((task: Task) => task.assignedTo === user?.id)
    : []

  const stats = {
    totalTasks: myTasks.length,
    completedTasks: myTasks.filter((t) => t.status === "completed").length,
    inProgressTasks: myTasks.filter((t) => t.status === "in-progress").length,
    todoTasks: myTasks.filter((t) => t.status === "pending").length,
  }

  const handleStatusChange = (taskId: string, newStatus: Status) => {
    updateTask(taskId, { status: newStatus })
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold">My Dashboard</h1>
        <p className="text-muted-foreground">View and manage your assigned tasks</p>
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
            <CardTitle className="text-sm font-medium">To Do</CardTitle>
            <AlertCircle className="h-4 w-4 text-gray-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.todoTasks}</div>
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
            <CardTitle className="text-sm font-medium">Completed</CardTitle>
            <CheckCircle2 className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.completedTasks}</div>
          </CardContent>
        </Card>
      </div>

      {/* Tasks Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {myTasks.map((task) => (
          <Card key={task.id || task._id} className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="space-y-1 flex-1">
                  <CardTitle className="text-lg">{task.title}</CardTitle>
                  <CardDescription className="line-clamp-2">{task.description}</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-2">
                <Badge variant="outline" className={priorityColors[task.priority]}>
                  {task.priority}
                </Badge>
                <Badge variant="outline" className={statusColors[task.status]}>
                  {task.status}
                </Badge>
              </div>

              {task.dueDate && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Calendar className="h-4 w-4" />
                  <span>Due: {new Date(task.dueDate).toLocaleDateString()}</span>
                </div>
              )}

              <div className="space-y-2">
                <label className="text-sm font-medium">Update Status</label>
                <Select
                  value={task.status}
                  onValueChange={(value: Status) => handleStatusChange(task.id || task._id!, value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="todo">To Do</SelectItem>
                    <SelectItem value="in-progress">In Progress</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {myTasks.length === 0 && (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <AlertCircle className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No tasks assigned</h3>
            <p className="text-muted-foreground text-center">
              You don't have any tasks assigned yet. Check back later!
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
