import { useState, useEffect } from "react";
import { User, Mail, Calendar, MapPin, Edit, ChevronDown, ChevronRight, Clock, AlertCircle, Loader2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { useAuth } from "@/hooks/useAuth";
import { useForm } from "react-hook-form";
import { useToast } from "@/hooks/use-toast";
import { MemberDashboard } from "@/components/MemberDashboard";

interface UserProfile {
  email: string;
  username: string;
  full_name: string;
  id: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

interface Task {
  id: number;
  title: string;
  description: string;
  status: string;
  priority: string;
  due_date: string;
  start_date?: string;
  assignee_id?: number;
  creator_id: number;
  project_id?: number;
  ai_category?: string;
  ai_estimated_hours?: number;
  is_completed: boolean;
  completed_at?: string;
  created_at: string;
  updated_at: string;
}

interface Subtask {
  title: string;
  description: string;
  assignee_id: number;
  status: string;
  priority: string;
  start_date: string;
  due_date: string;
  id: number;
  task_id: number;
  creator_id: number;
  ai_category: string;
  ai_estimated_hours: number;
  is_completed: boolean;
  completed_at: string;
  created_at: string;
  updated_at: string;
}

interface SubtaskBreakdown {
  title: string;
  description: string;
  estimated_hours: number;
  priority: string;
  order: number;
}

const Profile = () => {
  const { serviceUser, serviceAccessToken } = useAuth();
  const { toast } = useToast();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [tasksLoading, setTasksLoading] = useState(false);
  const [expandedTasks, setExpandedTasks] = useState<Set<number>>(new Set());
  const [subtasks, setSubtasks] = useState<Record<number, Subtask[]>>({});
  const [subtasksLoading, setSubtasksLoading] = useState<Set<number>>(new Set());
  const [breakdownLoading, setBreakdownLoading] = useState<Set<number>>(new Set());
  const [isCreateSubtasksModalOpen, setIsCreateSubtasksModalOpen] = useState(false);
  const [currentBreakdown, setCurrentBreakdown] = useState<SubtaskBreakdown[]>([]);
  const [currentTaskId, setCurrentTaskId] = useState<number | null>(null);

  const form = useForm({
    defaultValues: {
      email: "",
      username: "",
      full_name: "",
    },
  });

  const subtaskForms = useForm({
    defaultValues: {
      subtasks: [] as Array<{
        title: string;
        description: string;
        assignee_id: number;
        status: string;
        priority: string;
        start_date: string;
        due_date: string;
      }>
    },
  });

  const fetchProfile = async () => {
    if (!serviceUser?.id || !serviceAccessToken) return;
    
    try {
      const response = await fetch(`https://team-sync-pro-nguyentrieu8.replit.app/users/${serviceUser.id}`, {
        headers: {
          Authorization: `Bearer ${serviceAccessToken}`,
        },
      });
      
      if (response.ok) {
        const data = await response.json();
        setProfile(data);
        form.reset({
          email: data.email,
          username: data.username,
          full_name: data.full_name,
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load profile data",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const onSubmit = async (data: { email: string; username: string; full_name: string }) => {
    if (!serviceUser?.id || !serviceAccessToken) return;

    try {
      const response = await fetch(`https://team-sync-pro-nguyentrieu8.replit.app/users/${serviceUser.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${serviceAccessToken}`,
        },
        body: JSON.stringify(data),
      });

      if (response.ok) {
        toast({
          title: "Success",
          description: "Profile updated successfully",
        });
        setIsEditModalOpen(false);
        fetchProfile();
      } else {
        throw new Error("Failed to update profile");
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update profile",
        variant: "destructive",
      });
    }
  };

  const fetchTasks = async () => {
    if (!serviceUser?.id || !serviceAccessToken) return;
    
    setTasksLoading(true);
    try {
      const response = await fetch(`https://team-sync-pro-nguyentrieu8.replit.app/tasks/user/${serviceUser.id}`, {
        headers: {
          Authorization: `Bearer ${serviceAccessToken}`,
        },
      });
      
      if (response.ok) {
        const data = await response.json();
        setTasks(data);
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load tasks",
        variant: "destructive",
      });
    } finally {
      setTasksLoading(false);
    }
  };

  const fetchSubtasks = async (taskId: number) => {
    if (!serviceAccessToken) return;
    
    setSubtasksLoading(prev => new Set([...prev, taskId]));
    try {
      const response = await fetch(`https://team-sync-pro-nguyentrieu8.replit.app/tasks/${taskId}/subtasks`, {
        headers: {
          Authorization: `Bearer ${serviceAccessToken}`,
        },
      });
      
      if (response.ok) {
        const data = await response.json();
        setSubtasks(prev => ({ ...prev, [taskId]: data }));
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load subtasks",
        variant: "destructive",
      });
    } finally {
      setSubtasksLoading(prev => {
        const newSet = new Set(prev);
        newSet.delete(taskId);
        return newSet;
      });
    }
  };

  const breakdownTask = async (task: Task) => {
    if (!serviceAccessToken) return;
    
    setBreakdownLoading(prev => new Set([...prev, task.id]));
    try {
      const response = await fetch(`https://team-sync-pro-nguyentrieu8.replit.app/ai/breakdown`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${serviceAccessToken}`,
        },
        body: JSON.stringify({
          task_title: task.title,
          task_description: task.description,
        }),
      });
      
      if (response.ok) {
        const data = await response.json();
        setCurrentBreakdown(data.subtasks);
        setCurrentTaskId(task.id);
        
        // Initialize form with breakdown data
        const subtaskData = data.subtasks.map((subtask: SubtaskBreakdown) => ({
          title: subtask.title,
          description: subtask.description,
          assignee_id: serviceUser?.id || 0,
          status: "todo",
          priority: subtask.priority,
          start_date: new Date().toISOString().split('T')[0],
          due_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        }));
        
        subtaskForms.reset({ subtasks: subtaskData });
        setIsCreateSubtasksModalOpen(true);
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to break down task",
        variant: "destructive",
      });
    } finally {
      setBreakdownLoading(prev => {
        const newSet = new Set(prev);
        newSet.delete(task.id);
        return newSet;
      });
    }
  };

  const createSubtask = async (index: number, subtaskData: any) => {
    if (!currentTaskId || !serviceUser?.id || !serviceAccessToken) return;
    
    try {
      const response = await fetch(`https://team-sync-pro-nguyentrieu8.replit.app/tasks/${currentTaskId}/subtasks?creator_id=${serviceUser.id}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${serviceAccessToken}`,
        },
        body: JSON.stringify(subtaskData),
      });
      
      if (response.ok) {
        toast({
          title: "Success",
          description: `Subtask ${index + 1} created successfully`,
        });
        
        // Refresh subtasks for this task
        fetchSubtasks(currentTaskId);
      }
    } catch (error) {
      toast({
        title: "Error",
        description: `Failed to create subtask ${index + 1}`,
        variant: "destructive",
      });
    }
  };

  const toggleTaskExpansion = (taskId: number) => {
    const newExpanded = new Set(expandedTasks);
    if (newExpanded.has(taskId)) {
      newExpanded.delete(taskId);
    } else {
      newExpanded.add(taskId);
      // Fetch subtasks when expanding
      if (!subtasks[taskId]) {
        fetchSubtasks(taskId);
      }
    }
    setExpandedTasks(newExpanded);
  };

  const getPriorityColor = (priority: string) => {
    switch (priority.toLowerCase()) {
      case 'high': return 'destructive';
      case 'medium': return 'secondary';
      case 'low': return 'outline';
      default: return 'outline';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'completed': return 'default';
      case 'in_progress': return 'secondary';
      case 'todo': return 'outline';
      default: return 'outline';
    }
  };

  useEffect(() => {
    fetchProfile();
    fetchTasks();
  }, [serviceUser?.id, serviceAccessToken]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background p-6 flex items-center justify-center">
        <div>Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="flex items-center gap-3">
          <User className="h-6 w-6 text-primary" />
          <h1 className="text-3xl font-bold text-foreground">Profile</h1>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>User Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center space-x-4">
              <Avatar className="h-20 w-20">
                <AvatarFallback className="text-lg">
                  {profile?.full_name?.[0] || profile?.email?.[0]?.toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div className="space-y-2">
                <h3 className="text-xl font-semibold">
                  {profile?.full_name || "Anonymous User"}
                </h3>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Mail className="h-4 w-4" />
                  <span>{profile?.email}</span>
                </div>
                {profile?.username && (
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <span>@{profile.username}</span>
                  </div>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <h4 className="font-medium">Account Details</h4>
                <div className="text-sm text-muted-foreground space-y-1">
                  <div>User ID: {profile?.id}</div>
                  <div className="flex items-center gap-2">
                    <Calendar className="h-3 w-3" />
                    <span>Created: {profile?.created_at ? new Date(profile.created_at).toLocaleDateString() : "N/A"}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Calendar className="h-3 w-3" />
                    <span>Updated: {profile?.updated_at ? new Date(profile.updated_at).toLocaleDateString() : "N/A"}</span>
                  </div>
                </div>
              </div>
              
              <div className="space-y-2">
                <h4 className="font-medium">Status</h4>
                <div className="text-sm text-muted-foreground">
                  <div>Active: {profile?.is_active ? "Yes" : "No"}</div>
                </div>
              </div>
            </div>

            <div className="pt-4 border-t">
              <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
                <DialogTrigger asChild>
                  <Button variant="outline">
                    <Edit className="h-4 w-4 mr-2" />
                    Edit Profile
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Edit Profile</DialogTitle>
                  </DialogHeader>
                  <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                      <FormField
                        control={form.control}
                        name="email"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Email</FormLabel>
                            <FormControl>
                              <Input {...field} type="email" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="username"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Username</FormLabel>
                            <FormControl>
                              <Input {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="full_name"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Full Name</FormLabel>
                            <FormControl>
                              <Input {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <div className="flex justify-end gap-2">
                        <Button type="button" variant="outline" onClick={() => setIsEditModalOpen(false)}>
                          Cancel
                        </Button>
                        <Button type="submit">Save Changes</Button>
                      </div>
                    </form>
                  </Form>
                </DialogContent>
              </Dialog>
            </div>
          </CardContent>
        </Card>

        {/* Member Dashboard Section */}
        <MemberDashboard />

        {/* Task Lists Section */}
        <Card>
          <CardHeader>
            <CardTitle>Task Lists</CardTitle>
          </CardHeader>
          <CardContent>
            {tasksLoading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin" />
                <span className="ml-2">Loading tasks...</span>
              </div>
            ) : tasks.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                No tasks found
              </div>
            ) : (
              <div className="space-y-4">
                {tasks.map((task) => (
                  <Card key={task.id} className="border-l-4 border-l-primary">
                    <CardContent className="p-4">
                      <div className="space-y-3">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <h3 className="font-semibold text-lg">{task.title}</h3>
                            <p className="text-muted-foreground mt-1">{task.description}</p>
                          </div>
                          <div className="flex gap-2">
                            <Badge variant={getPriorityColor(task.priority)}>
                              {task.priority}
                            </Badge>
                            <Badge variant={getStatusColor(task.status)}>
                              {task.status}
                            </Badge>
                          </div>
                        </div>

                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          {task.due_date && (
                            <div className="flex items-center gap-1">
                              <Calendar className="h-3 w-3" />
                              <span>Due: {new Date(task.due_date).toLocaleDateString()}</span>
                            </div>
                          )}
                          {task.ai_estimated_hours && (
                            <div className="flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              <span>{task.ai_estimated_hours}h estimated</span>
                            </div>
                          )}
                        </div>

                        {/* Subtasks Section */}
                        <Collapsible
                          open={expandedTasks.has(task.id)}
                          onOpenChange={() => toggleTaskExpansion(task.id)}
                        >
                          <CollapsibleTrigger asChild>
                            <Button variant="ghost" className="w-full justify-start p-0 h-auto">
                              <div className="flex items-center gap-2">
                                {expandedTasks.has(task.id) ? (
                                  <ChevronDown className="h-4 w-4" />
                                ) : (
                                  <ChevronRight className="h-4 w-4" />
                                )}
                                <span className="text-sm">
                                  {subtasks[task.id]?.length ? `Subtasks (${subtasks[task.id].length})` : 'Subtasks'}
                                </span>
                              </div>
                            </Button>
                          </CollapsibleTrigger>
                          <CollapsibleContent className="mt-3">
                            {subtasksLoading.has(task.id) ? (
                              <div className="flex items-center gap-2 py-4">
                                <Loader2 className="h-4 w-4 animate-spin" />
                                <span className="text-sm">Loading subtasks...</span>
                              </div>
                            ) : subtasks[task.id]?.length ? (
                              <div className="space-y-2 pl-6 border-l-2 border-muted">
                                {subtasks[task.id].map((subtask) => (
                                  <div key={subtask.id} className="p-3 bg-muted/30 rounded-lg">
                                    <div className="flex items-start justify-between">
                                      <div className="flex-1">
                                        <h4 className="font-medium text-sm">{subtask.title}</h4>
                                        <p className="text-xs text-muted-foreground mt-1">{subtask.description}</p>
                                      </div>
                                      <div className="flex gap-1">
                                        <Badge variant={getPriorityColor(subtask.priority)} className="text-xs">
                                          {subtask.priority}
                                        </Badge>
                                        <Badge variant={getStatusColor(subtask.status)} className="text-xs">
                                          {subtask.status}
                                        </Badge>
                                      </div>
                                    </div>
                                    {(subtask.due_date || subtask.ai_estimated_hours) && (
                                      <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground">
                                        {subtask.due_date && (
                                          <div className="flex items-center gap-1">
                                            <Calendar className="h-3 w-3" />
                                            <span>Due: {new Date(subtask.due_date).toLocaleDateString()}</span>
                                          </div>
                                        )}
                                        {subtask.ai_estimated_hours && (
                                          <div className="flex items-center gap-1">
                                            <Clock className="h-3 w-3" />
                                            <span>{subtask.ai_estimated_hours}h</span>
                                          </div>
                                        )}
                                      </div>
                                    )}
                                  </div>
                                ))}
                              </div>
                            ) : (
                              <div className="pl-6">
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => breakdownTask(task)}
                                  disabled={breakdownLoading.has(task.id)}
                                  className="w-full"
                                >
                                  {breakdownLoading.has(task.id) ? (
                                    <>
                                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                                      Breaking down...
                                    </>
                                  ) : (
                                    <>
                                      <AlertCircle className="h-4 w-4 mr-2" />
                                      Break Sub-tasks
                                    </>
                                  )}
                                </Button>
                              </div>
                            )}
                          </CollapsibleContent>
                        </Collapsible>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Create Subtasks Modal */}
      <Dialog open={isCreateSubtasksModalOpen} onOpenChange={setIsCreateSubtasksModalOpen}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Create Subtasks</DialogTitle>
          </DialogHeader>
          <div className="space-y-6">
            {currentBreakdown.map((breakdown, index) => (
              <Card key={index} className="p-4">
                <h3 className="font-semibold mb-4">Subtask {index + 1}</h3>
                <Form {...subtaskForms}>
                  <form
                    onSubmit={subtaskForms.handleSubmit((data) => createSubtask(index, data.subtasks[index]))}
                    className="space-y-4"
                  >
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField
                        control={subtaskForms.control}
                        name={`subtasks.${index}.title`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Title</FormLabel>
                            <FormControl>
                              <Input {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={subtaskForms.control}
                        name={`subtasks.${index}.priority`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Priority</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select priority" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="low">Low</SelectItem>
                                <SelectItem value="medium">Medium</SelectItem>
                                <SelectItem value="high">High</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <FormField
                      control={subtaskForms.control}
                      name={`subtasks.${index}.description`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Description</FormLabel>
                          <FormControl>
                            <Textarea {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField
                        control={subtaskForms.control}
                        name={`subtasks.${index}.start_date`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Start Date</FormLabel>
                            <FormControl>
                              <Input {...field} type="date" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={subtaskForms.control}
                        name={`subtasks.${index}.due_date`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Due Date</FormLabel>
                            <FormControl>
                              <Input {...field} type="date" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <Button type="submit" className="w-full">
                      Create Subtask {index + 1}
                    </Button>
                  </form>
                </Form>
              </Card>
            ))}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Profile;