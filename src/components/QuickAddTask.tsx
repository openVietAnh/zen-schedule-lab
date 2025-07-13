import { useState } from "react";
import { Plus, Zap, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface QuickAddTaskProps {
  onAddTask: (task: {
    title: string;
    priority: "high" | "medium" | "low";
    estimatedTime?: number;
  }) => void;
}

export const QuickAddTask = ({ onAddTask }: QuickAddTaskProps) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [title, setTitle] = useState("");
  const [priority, setPriority] = useState<"high" | "medium" | "low">("medium");
  const [estimatedTime, setEstimatedTime] = useState<number | undefined>();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    onAddTask({
      title: title.trim(),
      priority,
      estimatedTime
    });

    // Reset form
    setTitle("");
    setPriority("medium");
    setEstimatedTime(undefined);
    setIsExpanded(false);
  };

  const handleQuickAdd = () => {
    if (!isExpanded) {
      setIsExpanded(true);
      return;
    }
    handleSubmit(new Event('submit') as any);
  };

  return (
    <Card className="overflow-hidden transition-all duration-300 hover:shadow-md">
      {!isExpanded ? (
        <Button
          variant="ghost"
          onClick={() => setIsExpanded(true)}
          className="w-full h-14 flex items-center justify-start gap-3 px-4 text-muted-foreground hover:text-foreground"
        >
          <Plus className="h-5 w-5" />
          <span>Add a task...</span>
        </Button>
      ) : (
        <form onSubmit={handleSubmit} className="p-4 space-y-4">
          <Input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="What needs to be done?"
            className="border-none shadow-none text-base px-0 focus-visible:ring-0"
            autoFocus
          />
          
          <div className="flex gap-2">
            <Select value={priority} onValueChange={(value: "high" | "medium" | "low") => setPriority(value)}>
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="high">
                  <div className="flex items-center gap-2">
                    <Zap className="h-3 w-3 text-warning" />
                    High
                  </div>
                </SelectItem>
                <SelectItem value="medium">
                  <div className="flex items-center gap-2">
                    <div className="h-3 w-3 rounded-full bg-primary" />
                    Medium
                  </div>
                </SelectItem>
                <SelectItem value="low">
                  <div className="flex items-center gap-2">
                    <div className="h-3 w-3 rounded-full bg-muted-foreground" />
                    Low
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
            
            <div className="flex items-center gap-2 flex-1">
              <Clock className="h-4 w-4 text-muted-foreground" />
              <Input
                type="number"
                value={estimatedTime || ""}
                onChange={(e) => setEstimatedTime(e.target.value ? parseInt(e.target.value) : undefined)}
                placeholder="25"
                className="w-20 text-center"
                min="1"
                max="480"
              />
              <span className="text-sm text-muted-foreground">min</span>
            </div>
          </div>

          <div className="flex gap-2">
            <Button type="submit" size="sm" className="bg-gradient-primary">
              Add Task
            </Button>
            <Button 
              type="button" 
              variant="ghost" 
              size="sm"
              onClick={() => setIsExpanded(false)}
            >
              Cancel
            </Button>
          </div>
        </form>
      )}
    </Card>
  );
};