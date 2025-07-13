import { useState, useEffect } from "react";
import { Play, Pause, RotateCcw, Coffee } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ProgressRing } from "./ProgressRing";
import { useToast } from "@/hooks/use-toast";

type TimerMode = "work" | "shortBreak" | "longBreak";

export const PomodoroTimer = () => {
  const [mode, setMode] = useState<TimerMode>("work");
  const [timeLeft, setTimeLeft] = useState(25 * 60); // 25 minutes in seconds
  const [isRunning, setIsRunning] = useState(false);
  const [completedPomodoros, setCompletedPomodoros] = useState(0);
  const { toast } = useToast();

  const durations = {
    work: 25 * 60,
    shortBreak: 5 * 60,
    longBreak: 15 * 60
  };

  const modeLabels = {
    work: "Focus Time",
    shortBreak: "Short Break",
    longBreak: "Long Break"
  };

  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    if (isRunning && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft((time) => time - 1);
      }, 1000);
    } else if (timeLeft === 0) {
      handleTimerComplete();
    }

    return () => clearInterval(interval);
  }, [isRunning, timeLeft]);

  const handleTimerComplete = () => {
    setIsRunning(false);
    
    if (mode === "work") {
      setCompletedPomodoros(prev => prev + 1);
      toast({
        title: "Focus session completed! 🌱",
        description: "Time for a well-deserved break.",
      });
      
      // Auto switch to break
      const nextMode = completedPomodoros % 4 === 3 ? "longBreak" : "shortBreak";
      setMode(nextMode);
      setTimeLeft(durations[nextMode]);
    } else {
      toast({
        title: "Break time over! ⚡",
        description: "Ready to focus again?",
      });
      setMode("work");
      setTimeLeft(durations.work);
    }
  };

  const toggleTimer = () => {
    setIsRunning(!isRunning);
  };

  const resetTimer = () => {
    setIsRunning(false);
    setTimeLeft(durations[mode]);
  };

  const switchMode = (newMode: TimerMode) => {
    setMode(newMode);
    setTimeLeft(durations[newMode]);
    setIsRunning(false);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const progress = ((durations[mode] - timeLeft) / durations[mode]) * 100;

  return (
    <Card className="p-6 bg-gradient-warm">
      <div className="text-center space-y-6">
        {/* Mode Selector */}
        <div className="flex justify-center gap-2">
          {(Object.keys(durations) as TimerMode[]).map((timerMode) => (
            <Button
              key={timerMode}
              variant={mode === timerMode ? "default" : "outline"}
              size="sm"
              onClick={() => switchMode(timerMode)}
              className="text-xs"
            >
              {timerMode === "work" && "Focus"}
              {timerMode === "shortBreak" && "Short"}
              {timerMode === "longBreak" && "Long"}
            </Button>
          ))}
        </div>

        {/* Timer Display */}
        <div className="space-y-4">
          <h2 className="text-lg font-medium text-foreground">
            {modeLabels[mode]}
          </h2>
          
          <div className="flex justify-center">
            <ProgressRing 
              progress={progress} 
              size="lg" 
              showPercentage={false}
              className="relative"
            />
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-2xl font-mono font-medium text-foreground">
                {formatTime(timeLeft)}
              </span>
            </div>
          </div>
        </div>

        {/* Controls */}
        <div className="flex justify-center gap-3">
          <Button
            onClick={toggleTimer}
            size="lg"
            className="bg-gradient-primary hover:shadow-glow transition-all duration-300"
          >
            {isRunning ? (
              <Pause className="h-5 w-5" />
            ) : (
              <Play className="h-5 w-5" />
            )}
          </Button>
          
          <Button
            onClick={resetTimer}
            variant="outline"
            size="lg"
          >
            <RotateCcw className="h-5 w-5" />
          </Button>
        </div>

        {/* Stats */}
        {completedPomodoros > 0 && (
          <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
            <Coffee className="h-4 w-4" />
            <span>{completedPomodoros} completed today</span>
          </div>
        )}
      </div>
    </Card>
  );
};