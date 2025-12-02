import type { Task } from "./task-board"
import { Card } from "@/components/ui/card"
import { CheckCircle2, Clock, AlertCircle, TrendingUp } from "lucide-react"

interface TaskStatsProps {
  tasks: Task[]
}

export function TaskStats({ tasks }: TaskStatsProps) {
  const totalTasks = tasks.length
  const completedTasks = tasks.filter((t) => t.status === "done").length
  const inProgressTasks = tasks.filter((t) => t.status === "in-progress").length
  const highPriorityTasks = tasks.filter((t) => t.priority === "high").length
  const completionRate = Math.round((completedTasks / totalTasks) * 100)

  const stats = [
    {
      label: "Total Tasks",
      value: totalTasks,
      icon: TrendingUp,
      color: "text-primary",
      bgColor: "bg-primary/10",
    },
    {
      label: "In Progress",
      value: inProgressTasks,
      icon: Clock,
      color: "text-amber-500",
      bgColor: "bg-amber-500/10",
    },
    {
      label: "Completed",
      value: completedTasks,
      icon: CheckCircle2,
      color: "text-green-500",
      bgColor: "bg-green-500/10",
    },
    {
      label: "High Priority",
      value: highPriorityTasks,
      icon: AlertCircle,
      color: "text-red-500",
      bgColor: "bg-red-500/10",
    },
  ]

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {stats.map((stat) => (
        <Card key={stat.label} className="p-4 md:p-5 bg-card border-border hover:border-primary/50 transition-colors">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <p className="text-xs md:text-sm text-muted-foreground font-medium">{stat.label}</p>
              <p className="text-2xl md:text-3xl font-bold tracking-tight">{stat.value}</p>
            </div>
            <div className={`p-2 md:p-3 rounded-lg ${stat.bgColor}`}>
              <stat.icon className={`h-5 w-5 md:h-6 md:w-6 ${stat.color}`} />
            </div>
          </div>
        </Card>
      ))}
    </div>
  )
}
