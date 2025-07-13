import { Calendar, RefreshCw, CloudUpload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { TaskCard } from "@/components/TaskCard";
import { PomodoroTimer } from "@/components/PomodoroTimer";
import { QuickAddTask } from "@/components/QuickAddTask";
import { DailyStats } from "@/components/DailyStats";
import { TaskStatusUpdateDialog } from "@/components/TaskStatusUpdateDialog";
import { AITaskCreator, ExtractedTaskData } from "@/components/AITaskCreator";
import { useTasks, Task } from "@/hooks/useTasks";
import { useAuth } from "@/hooks/useAuth";
import { useState, useEffect } from "react";
import { toast } from "sonner";

interface ScheduledTask {
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

interface DailySchedule {
  date: string;
  day_name: string;
  scheduled_tasks: ScheduledTask[];
  total_scheduled_hours: number;
  remaining_capacity: number;
  capacity_utilization: number;
}

interface SmartSchedulerResponse {
  user_id: number;
  schedule_period: Record<string, string>;
  daily_schedules: DailySchedule[];
  unscheduled_tasks: any[];
  summary: Record<string, any>;
  recommendations: string[];
}

const Index = () => {
  const { serviceUser, serviceAccessToken } = useAuth();
  const {
    tasks,
    loading,
    error,
    refreshTasks,
    loadMore,
    toggleTaskStatus,
    hasMore,
  } = useTasks();
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [isStatusDialogOpen, setIsStatusDialogOpen] = useState(false);
  const [syncingAll, setSyncingAll] = useState(false);
  const [schedulingData, setSchedulingData] = useState<SmartSchedulerResponse | null>(null);
  const [loadingSchedule, setLoadingSchedule] = useState(false);

  const completedTasks = tasks.filter(
    (task) => task.status === "completed"
  ).length;
  const totalTasks = tasks.length;

  const currentDate = new Date();
  const dateString = currentDate.toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  const handleSyncAll = async () => {
    if (!serviceUser?.id || !serviceAccessToken) {
      toast.error("Authentication required");
      return;
    }

    setSyncingAll(true);
    try {
      const response = await fetch(
        `https://team-sync-pro-nguyentrieu8.replit.app/calendar/sync/all?user_id=${serviceUser.id}`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${serviceAccessToken}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        throw new Error("Failed to sync all tasks");
      }

      toast.success("All tasks synced to Google Calendar");
      refreshTasks();
      fetchSmartSchedule();
    } catch (error) {
      toast.error("Failed to sync tasks to calendar");
      console.error("Error syncing all tasks:", error);
    } finally {
      setSyncingAll(false);
    }
  };

  const fetchSmartSchedule = async () => {
    if (!serviceUser?.id || !serviceAccessToken) {
      return;
    }

    setLoadingSchedule(true);
    try {
      const today = new Date();
      const startDate = new Date(today);
      startDate.setHours(0, 0, 0, 0);
      
      const endDate = new Date(today);
      endDate.setDate(endDate.getDate() + 3);
      endDate.setHours(23, 59, 59, 999);

      const response = await fetch(
        `https://team-sync-pro-nguyentrieu8.replit.app/smart-scheduler/schedule-tasks?user_id=${serviceUser.id}&start_date=${startDate.toISOString()}&end_date=${endDate.toISOString()}`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${serviceAccessToken}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        throw new Error("Failed to fetch smart schedule");
      }

      const data = await response.json();
      setSchedulingData(data);
    } catch (error) {
      console.error("Error fetching smart schedule:", error);
    } finally {
      setLoadingSchedule(false);
    }
  };

  useEffect(() => {
    if (serviceUser?.id && serviceAccessToken && tasks.length > 0) {
      fetchSmartSchedule();
    }
  }, [serviceUser?.id, serviceAccessToken, tasks.length]);

  const handleAITaskCreation = async (
    extractedData: ExtractedTaskData,
    callback: () => void
  ) => {
    if (!serviceUser?.id || !serviceAccessToken) {
      toast.error("Authentication required");
      return;
    }

    try {
      const taskData = {
        title: extractedData.title,
        description: extractedData.description,
        priority: extractedData.priority,
        start_date: new Date(extractedData.start_date).toISOString(),
        due_date: new Date(extractedData.due_date).toISOString(),
        category: extractedData.category,
      };

      const response = await fetch(
        `https://team-sync-pro-nguyentrieu8.replit.app/tasks/?creator_id=${serviceUser.id}`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${serviceAccessToken}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(taskData),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to create task");
      }

      toast.success("Task created successfully!");
      refreshTasks();
      fetchSmartSchedule();
      callback();
    } catch (error) {
      toast.error("Failed to create task");
      console.error("Error creating task:", error);
    }
  };

  return (
    <div className="bg-background">
      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-8">
          {/* Welcome Section */}
          <div className="text-center space-y-2 animate-fade-in">
            <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
              <Calendar className="h-4 w-4" />
              <span>{dateString}</span>
            </div>
            <h2 className="text-3xl font-bold text-foreground">
              Good morning! ☀️
            </h2>
            <p className="text-muted-foreground">
              Ready to make today productive and meaningful?
            </p>
          </div>

          <PomodoroTimer />

          {/* Stats Overview */}
          <div className="animate-fade-in" style={{ animationDelay: "0.1s" }}>
            <DailyStats
              completedTasks={completedTasks}
              totalTasks={totalTasks}
              focusTime={85} // 1h 25m example
              streakDays={3}
            />
          </div>

          {/* Main Grid */}
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Tasks Column */}
            <div
              className="lg:col-span-2 space-y-6 animate-fade-in"
              style={{ animationDelay: "0.2s" }}
            >
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold flex items-center gap-2">
                    Today's Focus
                    <span className="text-sm font-normal text-muted-foreground">
                      ({completedTasks}/{totalTasks} completed)
                    </span>
                  </h3>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={handleSyncAll}
                      disabled={syncingAll || !serviceUser}
                    >
                      <CloudUpload
                        className={`h-4 w-4 ${
                          syncingAll ? "animate-spin" : ""
                        }`}
                      />
                      <span className="ml-1">Sync all</span>
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={refreshTasks}
                      disabled={loading}
                    >
                      <RefreshCw
                        className={`h-4 w-4 ${loading ? "animate-spin" : ""}`}
                      />
                    </Button>
                  </div>
                </div>

                <QuickAddTask onTaskAdded={refreshTasks} />

                {error && (
                  <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-lg text-sm text-destructive">
                    {error}
                  </div>
                )}

                <div className="space-y-3">
                  {loading && tasks.length === 0 ? (
                    <div className="space-y-3">
                      {[1, 2, 3].map((i) => (
                        <div
                          key={i}
                          className="h-20 bg-muted animate-pulse rounded-lg"
                        />
                      ))}
                    </div>
                  ) : (
                    <>
                      {tasks.map((task) => {
                        // Find scheduling info for this task
                        const schedulingInfo = schedulingData?.daily_schedules
                          .flatMap(schedule => schedule.scheduled_tasks)
                          .find(scheduledTask => scheduledTask.task_id === task.id);

                        return (
                          <TaskCard
                            key={task.id}
                            task={task}
                            onStatusUpdate={(task) => {
                              setSelectedTask(task);
                              setIsStatusDialogOpen(true);
                            }}
                            onStatusSynced={() => {
                              refreshTasks();
                              fetchSmartSchedule();
                            }}
                            schedulingInfo={schedulingInfo}
                          />
                        );
                      })}

                      {hasMore && (
                        <Button
                          variant="outline"
                          onClick={loadMore}
                          disabled={loading}
                          className="w-full"
                        >
                          {loading ? "Loading..." : "Load More"}
                        </Button>
                      )}
                    </>
                  )}
                </div>
              </div>
            </div>

            {/* Timer Column */}
            <div
              className="space-y-6 animate-fade-in"
              style={{ animationDelay: "0.3s" }}
            >
              {/* Motivational Quote */}
              <div className="p-6 bg-gradient-warm rounded-xl border text-center">
                <div className="animate-breathe">
                  <p className="text-sm italic text-muted-foreground mb-2">
                    "The way to get started is to quit talking and begin doing."
                  </p>
                  <p className="text-xs text-muted-foreground/80">
                    — Walt Disney
                  </p>
                </div>
              </div>

              {/* AI Task Creator */}
              <AITaskCreator onTaskCreated={handleAITaskCreation} />
            </div>
          </div>
        </div>
      </main>

      <TaskStatusUpdateDialog
        task={selectedTask}
        isOpen={isStatusDialogOpen}
        onClose={() => {
          setIsStatusDialogOpen(false);
          setSelectedTask(null);
        }}
        onSuccess={() => {
          refreshTasks();
        }}
      />
    </div>
  );
};

export default Index;
