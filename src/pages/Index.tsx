import { useState } from "react";
import { Calendar, Menu, Bell, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import { TaskCard } from "@/components/TaskCard";
import { PomodoroTimer } from "@/components/PomodoroTimer";
import { QuickAddTask } from "@/components/QuickAddTask";
import { DailyStats } from "@/components/DailyStats";

interface Task {
  id: string;
  title: string;
  completed: boolean;
  priority: "high" | "medium" | "low";
  estimatedTime?: number;
}

const Index = () => {
  const [tasks, setTasks] = useState<Task[]>([
    {
      id: "1",
      title: "Review project proposal",
      completed: false,
      priority: "high",
      estimatedTime: 45,
    },
    {
      id: "2",
      title: "Respond to team emails",
      completed: true,
      priority: "medium",
      estimatedTime: 15,
    },
    {
      id: "3",
      title: "Plan weekend trip",
      completed: false,
      priority: "low",
      estimatedTime: 30,
    },
  ]);

  const handleToggleTask = (id: string) => {
    setTasks((prev) =>
      prev.map((task) =>
        task.id === id ? { ...task, completed: !task.completed } : task
      )
    );
  };

  const handleAddTask = (newTask: Omit<Task, "id" | "completed">) => {
    const task: Task = {
      id: Date.now().toString(),
      completed: false,
      ...newTask,
    };
    setTasks((prev) => [task, ...prev]);
  };

  const completedTasks = tasks.filter((task) => task.completed).length;
  const totalTasks = tasks.length;

  const currentDate = new Date();
  const dateString = currentDate.toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-3">
              <Button variant="ghost" size="sm">
                <Menu className="h-5 w-5" />
              </Button>
              <div>
                <h1 className="text-xl font-semibold bg-gradient-primary bg-clip-text text-transparent">
                  Zen Schedule
                </h1>
                <p className="text-xs text-muted-foreground">
                  Mindful Productivity
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Button variant="ghost" size="sm">
                <Bell className="h-5 w-5" />
              </Button>
              <Button variant="ghost" size="sm">
                <Settings className="h-5 w-5" />
              </Button>
            </div>
          </div>
        </div>
      </header>

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
                <h3 className="text-lg font-semibold flex items-center gap-2">
                  Today's Focus
                  <span className="text-sm font-normal text-muted-foreground">
                    ({completedTasks}/{totalTasks} completed)
                  </span>
                </h3>

                <QuickAddTask onAddTask={handleAddTask} />

                <div className="space-y-3">
                  {tasks.map((task) => (
                    <TaskCard
                      key={task.id}
                      task={task}
                      onToggleComplete={handleToggleTask}
                    />
                  ))}
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
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Index;
