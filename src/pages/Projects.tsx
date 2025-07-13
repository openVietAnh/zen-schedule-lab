import { FolderKanban, Plus, Calendar, Users, Edit, CheckCircle, Clock, AlertCircle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { useState, useEffect } from "react";

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

interface Task {
  id: number;
  title: string;
  description: string;
  project_id: number;
  assignee_id: number;
  parent_task_id: number;
  status: "todo" | "in_progress" | "done";
  priority: "low" | "medium" | "high";
  due_date: string;
  creator_id: number;
  ai_category: string;
  ai_estimated_hours: number;
  completed_at: string | null;
  created_at: string;
  updated_at: string;
}

interface Team {
  id: number;
  name: string;
  description: string;
  owner_id: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

const Projects = () => {
  const { serviceUser } = useAuth();
  const { toast } = useToast();
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [projectTasks, setProjectTasks] = useState<Task[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({
    name: "",
    description: "",
    team_id: 0
  });
  const [teams, setTeams] = useState<Team[]>([]);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [createForm, setCreateForm] = useState({
    name: "",
    description: "",
    team_id: ""
  });

  useEffect(() => {
    if (serviceUser?.id) {
      fetchProjects();
      fetchTeams();
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
      } else {
        toast({
          title: "Error",
          description: "Failed to fetch projects",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to connect to server",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchTeams = async () => {
    try {
      const response = await fetch(
        `https://team-sync-pro-nguyentrieu8.replit.app/teams/user/${serviceUser?.id}`
      );
      if (response.ok) {
        const data = await response.json();
        setTeams(data);
      } else {
        toast({
          title: "Error",
          description: "Failed to fetch teams",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to connect to server",
        variant: "destructive",
      });
    }
  };

  const fetchProjectTasks = async (projectId: number) => {
    try {
      const response = await fetch(
        `https://team-sync-pro-nguyentrieu8.replit.app/tasks/project/${projectId}`
      );
      if (response.ok) {
        const data = await response.json();
        setProjectTasks(data);
      } else {
        toast({
          title: "Error",
          description: "Failed to fetch project tasks",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to connect to server",
        variant: "destructive",
      });
    }
  };

  const handleViewProject = (project: Project) => {
    setSelectedProject(project);
    setEditForm({
      name: project.name,
      description: project.description || "",
      team_id: project.team_id
    });
    fetchProjectTasks(project.id);
    setIsModalOpen(true);
  };

  const handleEditToggle = () => {
    setIsEditing(!isEditing);
  };

  const handleUpdateProject = async () => {
    if (!selectedProject) return;

    try {
      const response = await fetch(
        `https://team-sync-pro-nguyentrieu8.replit.app/projects/${selectedProject.id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(editForm),
        }
      );

      if (response.ok) {
        const updatedProject = await response.json();
        setSelectedProject(updatedProject);
        setProjects(projects.map(p => p.id === updatedProject.id ? updatedProject : p));
        setIsEditing(false);
        toast({
          title: "Success",
          description: "Project updated successfully",
        });
      } else {
        toast({
          title: "Error",
          description: "Failed to update project",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to connect to server",
        variant: "destructive",
      });
    }
  };

  const handleCreateProject = async () => {
    if (!createForm.name || !createForm.team_id) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    try {
      const response = await fetch(
        "https://team-sync-pro-nguyentrieu8.replit.app/projects/",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            name: createForm.name,
            description: createForm.description || null,
            team_id: parseInt(createForm.team_id),
          }),
        }
      );

      if (response.ok) {
        const newProject = await response.json();
        setProjects([...projects, newProject]);
        setIsCreateModalOpen(false);
        setCreateForm({ name: "", description: "", team_id: "" });
        toast({
          title: "Success",
          description: "Project created successfully",
        });
      } else {
        toast({
          title: "Error",
          description: "Failed to create project",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to connect to server",
        variant: "destructive",
      });
    }
  };

  const getStatusColor = (isActive: boolean) => {
    return isActive 
      ? "bg-success text-success-foreground" 
      : "bg-muted text-muted-foreground";
  };

  const getTaskStatusIcon = (status: string) => {
    switch (status) {
      case "todo": return <Clock className="h-4 w-4 text-muted-foreground" />;
      case "in_progress": return <AlertCircle className="h-4 w-4 text-warning" />;
      case "done": return <CheckCircle className="h-4 w-4 text-success" />;
      default: return <Clock className="h-4 w-4 text-muted-foreground" />;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high": return "bg-destructive text-destructive-foreground";
      case "medium": return "bg-warning text-warning-foreground";
      case "low": return "bg-muted text-muted-foreground";
      default: return "bg-muted text-muted-foreground";
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background p-6 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading projects...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <FolderKanban className="h-6 w-6 text-primary" />
            <h1 className="text-3xl font-bold text-foreground">Projects</h1>
          </div>
          <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
            <DialogTrigger asChild>
              <Button className="flex items-center gap-2">
                <Plus className="h-4 w-4" />
                New Project
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>Create New Project</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="create-name">Project Name *</Label>
                  <Input
                    id="create-name"
                    value={createForm.name}
                    onChange={(e) => setCreateForm({...createForm, name: e.target.value})}
                    placeholder="Enter project name"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="create-description">Description</Label>
                  <Textarea
                    id="create-description"
                    value={createForm.description}
                    onChange={(e) => setCreateForm({...createForm, description: e.target.value})}
                    placeholder="Enter project description (optional)"
                    rows={3}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="create-team">Team *</Label>
                  <Select
                    value={createForm.team_id}
                    onValueChange={(value) => setCreateForm({...createForm, team_id: value})}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select a team" />
                    </SelectTrigger>
                    <SelectContent>
                      {teams.map((team) => (
                        <SelectItem key={team.id} value={team.id.toString()}>
                          {team.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="flex gap-2 pt-4">
                  <Button 
                    variant="outline" 
                    className="flex-1"
                    onClick={() => setIsCreateModalOpen(false)}
                  >
                    Cancel
                  </Button>
                  <Button onClick={handleCreateProject} className="flex-1">
                    Create Project
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {projects.length === 0 ? (
          <div className="text-center py-12">
            <FolderKanban className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium text-foreground mb-2">No projects found</h3>
            <p className="text-muted-foreground">Create your first project to get started.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {projects.map((project) => (
              <Card key={project.id} className="hover:shadow-md transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <CardTitle className="text-lg">{project.name}</CardTitle>
                    <Badge className={getStatusColor(project.is_active)}>
                      {project.is_active ? "Active" : "Inactive"}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-sm text-muted-foreground">
                    {project.description || "No description available"}
                  </p>
                  
                  <div className="flex items-center justify-between text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      <span>{new Date(project.created_at).toLocaleDateString()}</span>
                    </div>
                    <span>Team ID: {project.team_id}</span>
                  </div>

                  <Dialog open={isModalOpen && selectedProject?.id === project.id} onOpenChange={(open) => {
                    if (!open) {
                      setIsModalOpen(false);
                      setSelectedProject(null);
                      setIsEditing(false);
                    }
                  }}>
                    <DialogTrigger asChild>
                      <Button 
                        variant="outline" 
                        className="w-full"
                        onClick={() => handleViewProject(project)}
                      >
                        View Project
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
                      <DialogHeader>
                        <DialogTitle className="text-xl font-bold">
                          {selectedProject?.name}
                        </DialogTitle>
                      </DialogHeader>
                      
                      <Tabs defaultValue="tasks" className="w-full">
                        <TabsList className="grid w-full grid-cols-2">
                          <TabsTrigger value="tasks">Tasks</TabsTrigger>
                          <TabsTrigger value="details">Project Details</TabsTrigger>
                        </TabsList>
                        
                        <TabsContent value="tasks" className="space-y-4">
                          <div className="space-y-3">
                            <h3 className="text-lg font-semibold">Project Tasks</h3>
                            {projectTasks.length === 0 ? (
                              <div className="text-center py-8">
                                <p className="text-muted-foreground">No tasks found for this project.</p>
                              </div>
                            ) : (
                              <div className="space-y-3">
                                {projectTasks.map((task) => (
                                  <Card key={task.id} className="p-4">
                                    <div className="flex items-center justify-between mb-2">
                                      <div className="flex items-center gap-2">
                                        {getTaskStatusIcon(task.status)}
                                        <h4 className="font-medium">{task.title}</h4>
                                      </div>
                                      <div className="flex items-center gap-2">
                                        <Badge className={getPriorityColor(task.priority)}>
                                          {task.priority}
                                        </Badge>
                                        <Badge variant="outline">{task.status}</Badge>
                                      </div>
                                    </div>
                                    <p className="text-sm text-muted-foreground mb-2">
                                      {task.description}
                                    </p>
                                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                                      <span>Due: {new Date(task.due_date).toLocaleDateString()}</span>
                                      <span>Est. Hours: {task.ai_estimated_hours}</span>
                                    </div>
                                  </Card>
                                ))}
                              </div>
                            )}
                          </div>
                        </TabsContent>
                        
                        <TabsContent value="details" className="space-y-4">
                          <div className="space-y-4">
                            <div className="flex items-center justify-between">
                              <h3 className="text-lg font-semibold">Project Information</h3>
                              <Button
                                variant={isEditing ? "outline" : "default"}
                                size="sm"
                                onClick={handleEditToggle}
                              >
                                <Edit className="h-4 w-4 mr-2" />
                                {isEditing ? "Cancel" : "Edit"}
                              </Button>
                            </div>
                            
                            <div className="grid gap-4">
                              <div className="space-y-2">
                                <Label htmlFor="project-name">Project Name</Label>
                                <Input
                                  id="project-name"
                                  value={editForm.name}
                                  onChange={(e) => setEditForm({...editForm, name: e.target.value})}
                                  disabled={!isEditing}
                                />
                              </div>
                              
                              <div className="space-y-2">
                                <Label htmlFor="project-description">Description</Label>
                                <Textarea
                                  id="project-description"
                                  value={editForm.description}
                                  onChange={(e) => setEditForm({...editForm, description: e.target.value})}
                                  disabled={!isEditing}
                                  rows={3}
                                />
                              </div>
                              
                              <div className="space-y-2">
                                <Label htmlFor="team-id">Team ID</Label>
                                <Input
                                  id="team-id"
                                  type="number"
                                  value={editForm.team_id}
                                  onChange={(e) => setEditForm({...editForm, team_id: parseInt(e.target.value) || 0})}
                                  disabled={!isEditing}
                                />
                              </div>
                            </div>
                            
                            {isEditing && (
                              <div className="flex gap-2 pt-4">
                                <Button onClick={handleUpdateProject} className="flex-1">
                                  Submit Changes
                                </Button>
                              </div>
                            )}
                          </div>
                        </TabsContent>
                      </Tabs>
                    </DialogContent>
                  </Dialog>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Projects;