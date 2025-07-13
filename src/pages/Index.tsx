import { Calendar, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { TaskCard } from "@/components/TaskCard";
import { PomodoroTimer } from "@/components/PomodoroTimer";
import { QuickAddTask } from "@/components/QuickAddTask";
import { DailyStats } from "@/components/DailyStats";
import { useTasks } from "@/hooks/useTasks";

const Index = () => {
  const { tasks, loading, error, refreshTasks, loadMore, toggleTaskStatus, hasMore } = useTasks();

  const completedTasks = tasks.filter((task) => task.status === 'done').length;
  const totalTasks = tasks.length;


  const currentDate = new Date();
  const dateString = currentDate.toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

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
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={refreshTasks}
                    disabled={loading}
                  >
                    <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
                  </Button>
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
                        <div key={i} className="h-20 bg-muted animate-pulse rounded-lg" />
                      ))}
                    </div>
                  ) : (
                    <>
                      {tasks.map((task) => (
                        <TaskCard
                          key={task.id}
                          task={task}
                          onToggleComplete={toggleTaskStatus}
                        />
                      ))}
                      
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
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Index;
