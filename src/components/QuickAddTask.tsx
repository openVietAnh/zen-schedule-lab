import { useState, useEffect } from "react";
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

interface Project {
  id: number;
  name: string;
  description: string | null;
  team_id: number;
  creator_id: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

interface QuickAddTaskProps {
  onTaskAdded?: () => void;
}

export const QuickAddTask = ({ onTaskAdded }: QuickAddTaskProps) => {
  const { serviceUser } = useAuth();
  const { toast } = useToast();
  const [isExpanded, setIsExpanded] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [projects, setProjects] = useState<Project[]>([]);
  
  // Form fields
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [priority, setPriority] = useState<"low" | "medium" | "high" | "urgent">("medium");
  const [startDate, setStartDate] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [projectId, setProjectId] = useState<string>("");

  useEffect(() => {
    if (serviceUser?.id) {
      fetchProjects();
    }
  }, [serviceUser]);

  const fetchProjects = async () => {
    try {
      const response = await fetch(
        `https://team-sync-pro-nguyentrieu8.replit.app/projects/user/${serviceUser?.id}`
      );
      if (response.ok) {
        const data = await response.json();
        setProjects(data);
      }
    } catch (error) {
      console.error("Failed to fetch projects:", error);
    }
  };

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
          project_id: projectId ? parseInt(projectId) : null,
          assignee_id: null, // Using creator as assignee for now
          parent_task_id: null,
          status: "todo",
          priority,
          start_date: startDate ? new Date(startDate).toISOString() : null,
          due_date: dueDate ? new Date(dueDate).toISOString() : null,
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
      setStartDate("");
      setDueDate("");
      setProjectId("");
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
            className="text-base px-3"
            autoFocus
            required
          />
          
          <Textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Add a description..."
            className="px-3 resize-none"
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
              <Label className="text-sm font-medium">Project</Label>
              <Select value={projectId} onValueChange={setProjectId}>
                <SelectTrigger className="mt-2">
                  <SelectValue placeholder="Select project (optional)" />
                </SelectTrigger>
                <SelectContent>
                  {projects.map((project) => (
                    <SelectItem key={project.id} value={project.id.toString()}>
                      {project.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label className="text-sm font-medium">Start Date & Time</Label>
              <Input
                type="datetime-local"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="mt-2"
              />
            </div>
            
            <div>
              <Label className="text-sm font-medium">Due Date & Time</Label>
              <Input
                type="datetime-local"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="mt-2"
              />
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