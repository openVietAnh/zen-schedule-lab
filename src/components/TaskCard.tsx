import { Clock, CheckCircle, Circle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface TaskCardProps {
  task: {
    id: string;
    title: string;
    completed: boolean;
    priority: "high" | "medium" | "low";
    estimatedTime?: number;
  };
  onToggleComplete: (id: string) => void;
}

export const TaskCard = ({ task, onToggleComplete }: TaskCardProps) => {
  const priorityColors = {
    high: "bg-warning/10 border-warning/20",
    medium: "bg-primary/10 border-primary/20",
    low: "bg-muted border-border"
  };

  return (
    <Card 
      className={cn(
        "p-4 transition-all duration-300 hover:shadow-md group cursor-pointer",
        task.completed && "opacity-60",
        priorityColors[task.priority]
      )}
      onClick={() => onToggleComplete(task.id)}
    >
      <div className="flex items-center gap-3">
        <Button
          variant="ghost"
          size="sm"
          className="p-0 h-6 w-6 rounded-full hover:bg-transparent"
        >
          {task.completed ? (
            <CheckCircle className="h-5 w-5 text-success animate-scale-in" />
          ) : (
            <Circle className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors" />
          )}
        </Button>
        
        <div className="flex-1 min-w-0">
          <h3 
            className={cn(
              "text-sm font-medium transition-all duration-200",
              task.completed && "line-through text-muted-foreground"
            )}
          >
            {task.title}
          </h3>
          
          {task.estimatedTime && (
            <div className="flex items-center gap-1 mt-1 text-xs text-muted-foreground">
              <Clock className="h-3 w-3" />
              <span>{task.estimatedTime}m</span>
            </div>
          )}
        </div>
      </div>
    </Card>
  );
};