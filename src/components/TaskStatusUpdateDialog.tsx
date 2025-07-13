import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Task } from "@/hooks/useTasks";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";

interface TaskStatusUpdateDialogProps {
  task: Task | null;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const TaskStatusUpdateDialog = ({ 
  task, 
  isOpen, 
  onClose, 
  onSuccess 
}: TaskStatusUpdateDialogProps) => {
  const { serviceAccessToken } = useAuth();
  const { toast } = useToast();
  const [isUpdating, setIsUpdating] = useState(false);

  if (!task) return null;

  const getAvailableStatuses = () => {
    switch (task.status) {
      case "todo":
        return ["in_progress", "cancelled"];
      case "in_progress":
        return ["done", "cancelled"];
      case "done":
      case "cancelled":
        return [];
      default:
        return [];
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "in_progress":
        return "In Progress";
      case "done":
        return "Completed";
      case "cancelled":
        return "Cancelled";
      default:
        return status;
    }
  };

  const getStatusVariant = (status: string) => {
    switch (status) {
      case "in_progress":
        return "default";
      case "done":
        return "default";
      case "cancelled":
        return "destructive";
      default:
        return "secondary";
    }
  };

  const handleUpdateStatus = async (newStatus: string) => {
    setIsUpdating(true);
    
    try {
      const response = await fetch(
        `https://team-sync-pro-nguyentrieu8.replit.app/tasks/${task.id}`,
        {
          method: "PATCH",
          headers: {
            "Authorization": `Bearer ${serviceAccessToken}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            title: task.title,
            description: task.description,
            project_id: task.project_id,
            assignee_id: task.assignee_id,
            status: newStatus,
            priority: task.priority,
            start_date: task.created_at,
            due_date: task.due_date,
          }),
        }
      );

      if (response.ok) {
        toast({
          title: "Success",
          description: `Task status updated to ${getStatusLabel(newStatus).toLowerCase()}`,
        });
        onSuccess();
        onClose();
      } else {
        toast({
          title: "Error",
          description: "Failed to update task status",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to connect to server",
        variant: "destructive",
      });
    } finally {
      setIsUpdating(false);
    }
  };

  const availableStatuses = getAvailableStatuses();

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Update Task Status</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <div className="space-y-2">
            <h3 className="font-medium">{task.title}</h3>
            <p className="text-sm text-muted-foreground">
              Current status: <Badge variant="secondary">{getStatusLabel(task.status)}</Badge>
            </p>
          </div>

          {availableStatuses.length === 0 ? (
            <div className="text-center py-4">
              <p className="text-sm text-muted-foreground">
                This task cannot be updated. Tasks with status "{getStatusLabel(task.status).toLowerCase()}" are final.
              </p>
            </div>
          ) : (
            <>
              <div className="space-y-2">
                <p className="text-sm text-foreground">
                  What would you like to update the status to?
                </p>
                <div className="space-y-2">
                  {availableStatuses.map((status) => (
                    <Button
                      key={status}
                      variant={getStatusVariant(status)}
                      className="w-full justify-start"
                      onClick={() => handleUpdateStatus(status)}
                      disabled={isUpdating}
                    >
                      {getStatusLabel(status)}
                    </Button>
                  ))}
                </div>
              </div>
            </>
          )}

          <div className="flex gap-2 pt-4">
            <Button 
              variant="outline" 
              className="flex-1"
              onClick={onClose}
              disabled={isUpdating}
            >
              Cancel
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};