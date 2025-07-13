import { cn } from "@/lib/utils";

interface ProgressRingProps {
  progress: number; // 0-100
  size?: "sm" | "md" | "lg";
  showPercentage?: boolean;
  className?: string;
}

export const ProgressRing = ({ 
  progress, 
  size = "md", 
  showPercentage = false,
  className 
}: ProgressRingProps) => {
  const sizes = {
    sm: { width: 40, height: 40, strokeWidth: 3, fontSize: "text-xs" },
    md: { width: 60, height: 60, strokeWidth: 4, fontSize: "text-sm" },
    lg: { width: 80, height: 80, strokeWidth: 5, fontSize: "text-base" }
  };

  const { width, height, strokeWidth, fontSize } = sizes[size];
  const radius = (width - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const strokeDasharray = circumference;
  const strokeDashoffset = circumference - (progress / 100) * circumference;

  return (
    <div className={cn("relative inline-flex items-center justify-center", className)}>
      <svg
        width={width}
        height={height}
        className="transform -rotate-90 transition-all duration-500"
      >
        {/* Background circle */}
        <circle
          cx={width / 2}
          cy={height / 2}
          r={radius}
          stroke="currentColor"
          strokeWidth={strokeWidth}
          fill="transparent"
          className="text-muted opacity-20"
        />
        
        {/* Progress circle */}
        <circle
          cx={width / 2}
          cy={height / 2}
          r={radius}
          stroke="currentColor"
          strokeWidth={strokeWidth}
          fill="transparent"
          strokeDasharray={strokeDasharray}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          className="text-primary transition-all duration-700 ease-out"
          style={{
            filter: progress > 0 ? "drop-shadow(0 0 6px hsl(var(--primary-glow)))" : "none"
          }}
        />
      </svg>
      
      {showPercentage && (
        <div className={cn(
          "absolute inset-0 flex items-center justify-center font-medium text-foreground",
          fontSize
        )}>
          {Math.round(progress)}%
        </div>
      )}
    </div>
  );
};