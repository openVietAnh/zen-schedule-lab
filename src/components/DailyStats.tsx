import { TrendingUp, Target, Clock, Leaf } from "lucide-react";
import { Card } from "@/components/ui/card";
import { ProgressRing } from "./ProgressRing";

interface DailyStatsProps {
  completedTasks: number;
  totalTasks: number;
  focusTime: number; // in minutes
  streakDays: number;
}

export const DailyStats = ({ 
  completedTasks, 
  totalTasks, 
  focusTime, 
  streakDays 
}: DailyStatsProps) => {
  const completionRate = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;
  const focusHours = Math.floor(focusTime / 60);
  const focusMinutes = focusTime % 60;

  const stats = [
    {
      label: "Tasks Done",
      value: `${completedTasks}/${totalTasks}`,
      progress: completionRate,
      icon: Target,
      color: "text-primary"
    },
    {
      label: "Focus Time",
      value: focusHours > 0 ? `${focusHours}h ${focusMinutes}m` : `${focusMinutes}m`,
      progress: Math.min((focusTime / 120) * 100, 100), // Goal: 2 hours
      icon: Clock,
      color: "text-primary"
    },
    {
      label: "Streak",
      value: `${streakDays} days`,
      progress: Math.min((streakDays / 7) * 100, 100), // Weekly goal
      icon: Leaf,
      color: "text-success"
    }
  ];

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <TrendingUp className="h-5 w-5 text-primary" />
        <h2 className="text-lg font-semibold">Today's Progress</h2>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {stats.map((stat, index) => (
          <Card key={index} className="p-4 bg-gradient-secondary">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">{stat.label}</p>
                <p className="text-lg font-semibold">{stat.value}</p>
              </div>
              
              <div className="flex items-center gap-3">
                <stat.icon className={`h-5 w-5 ${stat.color}`} />
                <ProgressRing 
                  progress={stat.progress} 
                  size="sm"
                  className={stat.color}
                />
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};