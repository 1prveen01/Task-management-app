"use client"

import { useState, useEffect } from "react"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { TaskStats } from "./task-stats"
import { TaskColumn } from "./task-column"
import { getMyTasks } from "@/lib/api/task.js"



export type Task = {
  id: string
  title: string
  description: string
  assignee: {
    name: string
    avatar: string
    initials: string
  }
  priority: "low" | "medium" | "high"
  dueDate: string
  status: "todo" | "in-progress" | "review" | "done"
  tags: string[]
}

export function TaskBoard() {
  const [tasks, setTasks] = useState<Task[]>([])
  const [activeView, setActiveView] = useState("board")
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  useEffect(() => {
    const fetchTasks = async () => {
      try {
        setLoading(true)
        const fetchedTasks = await getMyTasks() // call your backend
        // Map backend fields to match frontend Task type if needed
        const formattedTasks = fetchedTasks.map((t: any) => ({
          id: t._id,
          title: t.title,
          description: t.description,
          assignee: {
            name: t.assignedTo?.fullName || "Unassigned",
            avatar: t.assignedTo?.avatar || "/placeholder.svg",
            initials: t.assignedTo
              ? t.assignedTo.fullName
                  .split(" ")
                  .map((n: string) => n[0])
                  .join("")
              : "NA",
          },
          priority: t.priority,
          dueDate: t.dueDate ? t.dueDate.split("T")[0] : "",
          status: t.status === "pending" ? "todo" : t.status, // match frontend status
          tags: t.tags || [],
        }))
        setTasks(formattedTasks)
      } catch (err: any) {
        console.error(err)
        setError(err.message || "Failed to fetch tasks")
      } finally {
        setLoading(false)
      }
    }

    fetchTasks()
  }, [])

  // Filter tasks by status
  const todoTasks = tasks.filter((t) => t.status === "todo")
  const inProgressTasks = tasks.filter((t) => t.status === "in-progress")
  const reviewTasks = tasks.filter((t) => t.status === "review")
  const doneTasks = tasks.filter((t) => t.status === "done")

  if (loading) return <p>Loading tasks...</p>
  if (error) return <p className="text-red-500">{error}</p>

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl md:text-3xl font-bold tracking-tight text-balance">My Tasks</h2>
          <p className="text-muted-foreground text-sm md:text-base">Track and manage your assigned work</p>
        </div>
        <Button className="gap-2">
          <Plus className="h-4 w-4" />
          New Task
        </Button>
      </div>

      <TaskStats tasks={tasks} />

      <Tabs value={activeView} onValueChange={setActiveView} className="w-full">
        <TabsList className="grid w-full max-w-md grid-cols-2">
          <TabsTrigger value="board">Board View</TabsTrigger>
          <TabsTrigger value="list">List View</TabsTrigger>
        </TabsList>

        <TabsContent value="board" className="mt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
            <TaskColumn title="To Do" tasks={todoTasks} count={todoTasks.length} />
            <TaskColumn title="In Progress" tasks={inProgressTasks} count={inProgressTasks.length} />
            <TaskColumn title="Review" tasks={reviewTasks} count={reviewTasks.length} />
            <TaskColumn title="Done" tasks={doneTasks} count={doneTasks.length} />
          </div>
        </TabsContent>

        <TabsContent value="list" className="mt-6">
          <div className="space-y-2">
            {tasks.map((task) => (
              <div
                key={task.id}
                className="flex items-center justify-between p-4 rounded-lg border border-border bg-card hover:bg-accent/50 transition-colors"
              >
                <div className="flex items-center gap-3 flex-1">
                  <input type="checkbox" className="h-4 w-4" />
                  <div className="flex-1">
                    <h4 className="font-medium">{task.title}</h4>
                    <p className="text-xs text-muted-foreground">{task.description}</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <span className="text-xs text-muted-foreground">{task.dueDate}</span>
                  <div className="flex items-center gap-2">
                    <img
                      src={task.assignee.avatar || "/placeholder.svg"}
                      alt={task.assignee.name}
                      className="h-6 w-6 rounded-full"
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
