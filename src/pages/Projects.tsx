import { FolderKanban, Plus, Calendar, Users } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

const Projects = () => {
  // Placeholder data - will be replaced with API data later
  const projects = [
    {
      id: 1,
      name: "Website Redesign",
      description: "Complete redesign of the company website with modern UI/UX",
      status: "active",
      members: 5,
      dueDate: "2025-08-15",
      progress: 65
    },
    {
      id: 2,
      name: "Mobile App Development",
      description: "Native mobile application for iOS and Android platforms",
      status: "planning",
      members: 3,
      dueDate: "2025-09-30",
      progress: 25
    },
    {
      id: 3,
      name: "Database Migration",
      description: "Migrate legacy database to modern cloud infrastructure",
      status: "completed",
      members: 2,
      dueDate: "2025-06-30",
      progress: 100
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active": return "bg-success text-success-foreground";
      case "planning": return "bg-warning text-warning-foreground";
      case "completed": return "bg-primary text-primary-foreground";
      default: return "bg-muted text-muted-foreground";
    }
  };

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <FolderKanban className="h-6 w-6 text-primary" />
            <h1 className="text-3xl font-bold text-foreground">Projects</h1>
          </div>
          <Button className="flex items-center gap-2">
            <Plus className="h-4 w-4" />
            New Project
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {projects.map((project) => (
            <Card key={project.id} className="hover:shadow-md transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <CardTitle className="text-lg">{project.name}</CardTitle>
                  <Badge className={getStatusColor(project.status)}>
                    {project.status}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  {project.description}
                </p>
                
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Progress</span>
                    <span>{project.progress}%</span>
                  </div>
                  <div className="w-full bg-muted rounded-full h-2">
                    <div 
                      className="bg-primary h-2 rounded-full transition-all"
                      style={{ width: `${project.progress}%` }}
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between text-sm text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <Users className="h-3 w-3" />
                    <span>{project.members} members</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    <span>{new Date(project.dueDate).toLocaleDateString()}</span>
                  </div>
                </div>

                <Button variant="outline" className="w-full">
                  View Project
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Projects;