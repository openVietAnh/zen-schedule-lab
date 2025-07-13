import { useState, useEffect, useRef } from "react";
import { Play, Pause, RotateCcw, Coffee, Focus, Eye, EyeOff } from "lucide-react";
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
  const [isFocusMode, setIsFocusMode] = useState(false);
  const { toast } = useToast();
  const wakeLockRef = useRef<WakeLockSentinel | null>(null);
  const originalTitle = useRef<string>(document.title);

  const durations = {
    work: 25 * 60,
    shortBreak: 5 * 60,
    longBreak: 15 * 60,
  };

  const modeLabels = {
    work: "Focus Time",
    shortBreak: "Short Break",
    longBreak: "Long Break",
  };

  // Focus mode effects
  useEffect(() => {
    const enableFocusMode = async () => {
      if (isFocusMode && isRunning && mode === "work") {
        try {
          // Request wake lock to keep screen active
          if ('wakeLock' in navigator) {
            wakeLockRef.current = await navigator.wakeLock.request('screen');
          }
          
          // Change document title to show timer
          document.title = `🍅 ${formatTime(timeLeft)} - Focus Time`;
          
          // Request notification permission (to potentially control them)
          if ('Notification' in window && Notification.permission === 'default') {
            await Notification.requestPermission();
          }
          
          // Hide browser chrome by requesting fullscreen (optional)
          if (document.documentElement.requestFullscreen) {
            await document.documentElement.requestFullscreen();
          }
          
        } catch (err) {
          console.log('Focus mode features partially unavailable:', err);
        }
      } else {
        // Restore normal state
        document.title = originalTitle.current;
        
        // Release wake lock
        if (wakeLockRef.current) {
          wakeLockRef.current.release();
          wakeLockRef.current = null;
        }
        
        // Exit fullscreen if active
        if (document.fullscreenElement) {
          document.exitFullscreen();
        }
      }
    };

    enableFocusMode();
  }, [isFocusMode, isRunning, mode, timeLeft]);

  // Update document title during focus mode
  useEffect(() => {
    if (isFocusMode && isRunning && mode === "work") {
      document.title = `🍅 ${formatTime(timeLeft)} - Focus Time`;
    }
  }, [timeLeft, isFocusMode, isRunning, mode]);

  // Handle visibility change to maintain focus
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (isFocusMode && isRunning && mode === "work" && document.hidden) {
        // Show a notification or update title when tab becomes hidden
        document.title = `🍅 ${formatTime(timeLeft)} - Focus Time (Keep focusing!)`;
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [isFocusMode, isRunning, mode, timeLeft]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      document.title = originalTitle.current;
      if (wakeLockRef.current) {
        wakeLockRef.current.release();
      }
    };
  }, []);

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
      setCompletedPomodoros((prev) => prev + 1);
      toast({
        title: "Focus session completed! 🌱",
        description: "Time for a well-deserved break.",
      });

      // Auto switch to break
      const nextMode =
        completedPomodoros % 4 === 3 ? "longBreak" : "shortBreak";
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
    return `${mins.toString().padStart(2, "0")}:${secs
      .toString()
      .padStart(2, "0")}`;
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
            {/* <ProgressRing 
              progress={progress} 
              size="lg" 
              showPercentage={false}
              className="relative"
            /> */}
            <div className="inset-0 flex items-center justify-center">
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

          <Button onClick={resetTimer} variant="outline" size="lg">
            <RotateCcw className="h-5 w-5" />
          </Button>
          
          {mode === "work" && (
            <Button
              onClick={() => setIsFocusMode(!isFocusMode)}
              variant={isFocusMode ? "default" : "outline"}
              size="lg"
              className={isFocusMode ? "bg-purple-600 hover:bg-purple-700" : ""}
            >
              <Focus className="h-5 w-5" />
            </Button>
          )}
        </div>

        {/* Focus Mode Indicator */}
        {isFocusMode && isRunning && mode === "work" && (
          <div className="bg-purple-100 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800 rounded-lg p-3">
            <div className="flex items-center justify-center gap-2 text-purple-700 dark:text-purple-300">
              <Focus className="h-4 w-4" />
              <span className="text-sm font-medium">Focus Mode Active</span>
            </div>
            <p className="text-xs text-purple-600 dark:text-purple-400 mt-1">
              Notifications minimized • Screen kept awake • Stay focused!
            </p>
          </div>
        )}

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
