

import type { Task } from "./task-board"
import { TaskCard } from "./task-card"


interface TaskColumnProps {
  title: string
  tasks: Task[]
  count: number
}

export function TaskColumn({ title, tasks, count }: TaskColumnProps) {
  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between px-1">
        <h3 className="font-semibold text-sm uppercase tracking-wide text-muted-foreground">{title}</h3>
        <span className="flex h-6 w-6 items-center justify-center rounded-full bg-muted text-xs font-medium">
          {count}
        </span>
      </div>
      <div className="space-y-3">
        {tasks.map((task) => (
          <TaskCard key={task.id} task={task} />
        ))}
      </div>
    </div>
  )
}
