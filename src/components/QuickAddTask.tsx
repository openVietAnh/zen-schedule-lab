import { useState } from "react";
import { Plus, Zap, Clock, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

interface QuickAddTaskProps {
  onTaskAdded?: () => void;
}

export const QuickAddTask = ({ onTaskAdded }: QuickAddTaskProps) => {
  const { serviceUser } = useAuth();
  const { toast } = useToast();
  const [isExpanded, setIsExpanded] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  
  // Form fields
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [priority, setPriority] = useState<"low" | "medium" | "high" | "urgent">("medium");
  const [dueDate, setDueDate] = useState<Date>();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !serviceUser?.id) return;

    setIsLoading(true);
    
    try {
      const url = new URL('https://team-sync-pro-nguyentrieu8.replit.app/tasks');
      url.searchParams.append('creator_id', serviceUser.id);
      
      const response = await fetch(url.toString(), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: title.trim(),
          description: description.trim() || null,
          project_id: null, // Will be implemented later
          assignee_id: null, // Using creator as assignee for now
          parent_task_id: null,
          status: "todo",
          priority,
          due_date: dueDate ? dueDate.toISOString() : null,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to create task');
      }

      toast({
        title: "Task created",
        description: "Your task has been successfully created.",
      });

      // Reset form
      setTitle("");
      setDescription("");
      setPriority("medium");
      setDueDate(undefined);
      setIsExpanded(false);
      
      if (onTaskAdded) {
        onTaskAdded();
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create task. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
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
            required
          />
          
          <Textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Add a description..."
            className="border-none shadow-none px-0 focus-visible:ring-0 resize-none"
            rows={2}
          />
          
          <div className="space-y-3">
            <div>
              <Label className="text-sm font-medium">Priority</Label>
              <RadioGroup value={priority} onValueChange={(value: "low" | "medium" | "high" | "urgent") => setPriority(value)} className="flex gap-4 mt-2">
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="low" id="low" />
                  <Label htmlFor="low" className="text-sm">Low</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="medium" id="medium" />
                  <Label htmlFor="medium" className="text-sm">Medium</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="high" id="high" />
                  <Label htmlFor="high" className="text-sm">High</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="urgent" id="urgent" />
                  <Label htmlFor="urgent" className="text-sm">Urgent</Label>
                </div>
              </RadioGroup>
            </div>
            
            <div>
              <Label className="text-sm font-medium">Due Date</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal mt-2",
                      !dueDate && "text-muted-foreground"
                    )}
                  >
                    <Calendar className="mr-2 h-4 w-4" />
                    {dueDate ? format(dueDate, "PPP") : <span>Pick a date</span>}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <CalendarComponent
                    mode="single"
                    selected={dueDate}
                    onSelect={setDueDate}
                    initialFocus
                    className="p-3 pointer-events-auto"
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>

          <div className="flex gap-2">
            <Button type="submit" size="sm" className="bg-gradient-primary" disabled={isLoading}>
              {isLoading ? "Adding..." : "Add Task"}
            </Button>
            <Button 
              type="button" 
              variant="ghost" 
              size="sm"
              onClick={() => setIsExpanded(false)}
              disabled={isLoading}
            >
              Cancel
            </Button>
          </div>
        </form>
      )}
    </Card>
  );
};