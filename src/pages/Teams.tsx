import { Users, Plus, Mail, UserPlus } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";

const Teams = () => {
  // Placeholder data - will be replaced with API data later
  const teams = [
    {
      id: 1,
      name: "Development Team",
      description: "Frontend and backend developers working on core features",
      members: [
        { id: 1, name: "John Doe", role: "Lead Developer", avatar: "" },
        { id: 2, name: "Jane Smith", role: "Frontend Developer", avatar: "" },
        { id: 3, name: "Mike Johnson", role: "Backend Developer", avatar: "" },
        { id: 4, name: "Sarah Wilson", role: "UI/UX Designer", avatar: "" }
      ],
      projects: 3
    },
    {
      id: 2,
      name: "Marketing Team",
      description: "Content creation, campaigns, and brand management",
      members: [
        { id: 5, name: "Emily Brown", role: "Marketing Manager", avatar: "" },
        { id: 6, name: "David Lee", role: "Content Creator", avatar: "" },
        { id: 7, name: "Lisa Chen", role: "Social Media Specialist", avatar: "" }
      ],
      projects: 2
    },
    {
      id: 3,
      name: "Product Team",
      description: "Product strategy, roadmap planning, and user research",
      members: [
        { id: 8, name: "Alex Kim", role: "Product Manager", avatar: "" },
        { id: 9, name: "Rachel Green", role: "UX Researcher", avatar: "" }
      ],
      projects: 4
    }
  ];

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Users className="h-6 w-6 text-primary" />
            <h1 className="text-3xl font-bold text-foreground">Teams</h1>
          </div>
          <Button className="flex items-center gap-2">
            <Plus className="h-4 w-4" />
            Create Team
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {teams.map((team) => (
            <Card key={team.id} className="hover:shadow-md transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-xl">{team.name}</CardTitle>
                    <p className="text-sm text-muted-foreground mt-1">
                      {team.description}
                    </p>
                  </div>
                  <Badge variant="outline">
                    {team.projects} projects
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="font-medium">Team Members</h4>
                    <span className="text-sm text-muted-foreground">
                      {team.members.length} members
                    </span>
                  </div>
                  
                  <div className="space-y-2">
                    {team.members.slice(0, 3).map((member) => (
                      <div key={member.id} className="flex items-center space-x-3">
                        <Avatar className="h-8 w-8">
                          <AvatarImage src={member.avatar} />
                          <AvatarFallback className="text-xs">
                            {member.name.split(' ').map(n => n[0]).join('')}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate">
                            {member.name}
                          </p>
                          <p className="text-xs text-muted-foreground truncate">
                            {member.role}
                          </p>
                        </div>
                      </div>
                    ))}
                    
                    {team.members.length > 3 && (
                      <div className="text-sm text-muted-foreground">
                        +{team.members.length - 3} more members
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button variant="outline" size="sm" className="flex-1">
                    <Mail className="h-3 w-3 mr-1" />
                    Message Team
                  </Button>
                  <Button variant="outline" size="sm" className="flex-1">
                    <UserPlus className="h-3 w-3 mr-1" />
                    Add Member
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Teams;