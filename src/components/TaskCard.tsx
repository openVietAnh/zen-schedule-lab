import {
  Clock,
  CheckCircle,
  Circle,
  Calendar,
  User,
  CloudUpload,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { Task } from "@/hooks/useTasks";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";

interface SchedulingInfo {
  task_id: number;
  title: string;
  description: string;
  estimated_hours: number;
  priority: string;
  due_date: string;
  scheduled_date: string;
  suggested_start_time: string;
  suggested_end_time: string;
  scheduling_reason: string;
}

interface TaskCardProps {
  task: Task;
  onStatusUpdate: (task: Task) => void;
  onStatusSynced: () => void;
  schedulingInfo?: SchedulingInfo;
}

export const TaskCard = ({
  task,
  onStatusUpdate,
  onStatusSynced,
  schedulingInfo,
}: TaskCardProps) => {
  const { serviceUser, serviceAccessToken } = useAuth();
  const isCompleted = task.status === "completed";
  const isDisabled = task.status === "completed" || task.status === "cancelled";

  const priorityColors = {
    urgent: "bg-destructive/10 border-destructive/20",
    high: "bg-warning/10 border-warning/20",
    medium: "bg-primary/10 border-primary/20",
    low: "bg-muted border-border",
  };

  const statusColors = {
    todo: "bg-slate-100 text-slate-800",
    in_progress: "bg-blue-100 text-blue-800",
    done: "bg-green-100 text-green-800",
    cancelled: "bg-red-100 text-red-800",
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return null;
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    });
  };

  const isOverdue =
    task.due_date && new Date(task.due_date) < new Date() && !isCompleted;

  const handleSyncToCalendar = async (e: React.MouseEvent) => {
    e.stopPropagation();

    if (!serviceUser?.id || !serviceAccessToken) {
      toast.error("Authentication required");
      return;
    }

    try {
      const response = await fetch(
        `https://team-sync-pro-nguyentrieu8.replit.app/calendar/sync/task/${task.id}?user_id=${serviceUser.id}`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${serviceAccessToken}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        throw new Error("Failed to sync task to calendar");
      }

      toast.success("Task synced to Google Calendar");
      onStatusSynced();
    } catch (error) {
      toast.error("Failed to sync task to calendar");
      console.error("Error syncing task:", error);
    }
  };

  return (
    <Card
      className={cn(
        "p-4 transition-all duration-300 hover:shadow-md group",
        isCompleted && "opacity-60",
        priorityColors[task.priority],
        isOverdue && "border-destructive/40 bg-destructive/5",
        !isDisabled && "cursor-pointer"
      )}
      onClick={() => !isDisabled && onStatusUpdate(task)}
    >
      <div className="space-y-3">
        {/* Header with status toggle and badges */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-start gap-3 flex-1 min-w-0">
            <Button
              variant="ghost"
              size="sm"
              className={cn(
                "p-0 h-6 w-6 rounded-full hover:bg-transparent flex-shrink-0 mt-0.5",
                isDisabled && "cursor-not-allowed opacity-50"
              )}
              disabled={isDisabled}
            >
              {isCompleted ? (
                <CheckCircle className="h-5 w-5 text-success animate-scale-in" />
              ) : (
                <Circle className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors" />
              )}
            </Button>

            <div className="flex-1 min-w-0">
              <h3
                className={cn(
                  "text-sm font-medium transition-all duration-200 leading-tight",
                  isCompleted && "line-through text-muted-foreground"
                )}
              >
                {task.title}
              </h3>

              {task.description && (
                <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                  {task.description}
                </p>
              )}
            </div>
          </div>

          <div className="flex gap-2 flex-shrink-0">
            <Badge
              variant="secondary"
              className={cn("text-xs", statusColors[task.status])}
            >
              {task.status.replace("_", " ")}
            </Badge>
            <Badge variant="outline" className="text-xs">
              {task.priority}
            </Badge>
          </div>
        </div>

        {/* Footer with metadata */}
        <div className="flex items-center justify-between text-xs text-muted-foreground pt-1 border-t border-border/50">
          <div className="flex items-center gap-3">
            {task.ai_estimated_hours && (
              <div className="flex items-center gap-1">
                <Clock className="h-3 w-3" />
                <span>{task.ai_estimated_hours}h</span>
              </div>
            )}

            {task.due_date && (
              <div className="flex items-center gap-2">
                <div
                  className={cn(
                    "flex items-center gap-1",
                    isOverdue && "text-destructive font-medium"
                  )}
                >
                  <Calendar className="h-3 w-3" />
                  <span>{formatDate(task.due_date)}</span>
                  {isOverdue && <span className="text-destructive">⚠</span>}
                </div>

                {task.calendar_sync_status === "pending" && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-5 px-2 text-xs text-primary hover:text-primary-foreground hover:bg-primary"
                    onClick={handleSyncToCalendar}
                  >
                    <CloudUpload className="h-3 w-3 mr-1" />
                    Sync to Google Calendar
                  </Button>
                )}
              </div>
            )}
          </div>

          <div className="text-xs">Created {formatDate(task.created_at)}</div>
        </div>

        {/* Smart Scheduling Information */}
        {schedulingInfo && (
          <div className="pt-2 border-t border-border/50">
            <div className="text-xs text-muted-foreground bg-primary/5 p-2 rounded">
              <span className="font-medium text-primary">
                Recommended to do this task in {schedulingInfo.estimated_hours} hours, 
                from {schedulingInfo.suggested_start_time} to {schedulingInfo.suggested_end_time}
              </span>
            </div>
          </div>
        )}
      </div>
    </Card>
  );
};
