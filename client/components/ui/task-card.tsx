"use client"

import type { Task } from "./task-board"
import { Card } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Calendar, Flag } from "lucide-react"
import { cn } from "@/lib/utils"

interface TaskCardProps {
  task: Task
}


export function TaskCard({ task }: TaskCardProps) {
  const priorityColors = {
    low: "bg-blue-500/10 text-blue-500",
    medium: "bg-amber-500/10 text-amber-500",
    high: "bg-red-500/10 text-red-500",
  }

  return (
    <Card className="p-4 cursor-pointer hover:shadow-lg hover:scale-[1.02] transition-all duration-200 border-border bg-card group">
      <div className="space-y-3">
        <div className="flex items-start justify-between gap-2">
          <h4 className="font-semibold text-sm leading-snug line-clamp-2 group-hover:text-primary transition-colors">
            {task.title}
          </h4>
          <Badge variant="secondary" className={cn("shrink-0 text-xs", priorityColors[task.priority])}>
            <Flag className="h-3 w-3 mr-1" />
            {task.priority}
          </Badge>
        </div>

        <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">{task.description}</p>

        <div className="flex flex-wrap gap-1">
          {task.tags.map((tag) => (
            <Badge key={tag} variant="outline" className="text-xs bg-muted/50 border-border">
              {tag}
            </Badge>
          ))}
        </div>

        <div className="flex items-center justify-between pt-2 border-t border-border/50">
          <div className="flex items-center gap-2">
            <Avatar className="h-7 w-7 border border-border">
              <AvatarImage src={task.assignee.avatar || "/placeholder.svg"} />
              <AvatarFallback className="text-xs bg-primary/10 text-primary">{task.assignee.initials}</AvatarFallback>
            </Avatar>
            <span className="text-xs text-muted-foreground">{task.assignee.name}</span>
          </div>

          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <Calendar className="h-3 w-3" />
            <span>{task.dueDate}</span>
          </div>
        </div>
      </div>
    </Card>
  )
}
