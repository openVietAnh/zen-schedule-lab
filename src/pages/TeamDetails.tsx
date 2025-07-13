import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useToast } from "@/hooks/use-toast";
import {
  Users,
  Calendar,
  Target,
  TrendingUp,
  AlertTriangle,
  Clock,
} from "lucide-react";

interface TeamMember {
  team_id: number;
  user_id: number;
  role: string;
  id: number;
  joined_at: string;
  user: {
    email: string;
    username: string;
    full_name: string;
    id: number;
    is_active: boolean;
    created_at: string;
    updated_at: string;
  };
}

interface Task {
  id: number;
  title: string;
  assignee_username: string;
  assignee_full_name: string;
  status: string;
  priority: string;
  ai_category: string;
  ai_estimated_hours: number;
  due_date: string;
  days_until_due: number;
  is_overdue: boolean;
  calendar_sync_status: string;
  created_at: string;
  completed_at: string;
}

interface SprintDashboard {
  sprint_stats: {
    sprint_name: string;
    start_date: string;
    end_date: string;
    total_tasks: number;
    completed_tasks: number;
    in_progress_tasks: number;
    not_started_tasks: number;
    sprint_completion_rate: number;
    total_story_points: number;
    completed_story_points: number;
    velocity: number;
    burndown_data: any[];
    scope_changes: number;
  };
  task_groups: Array<{
    status: string;
    tasks: Task[];
    total_hours: number;
    completion_percentage: number;
  }>;
  team_velocity: Record<string, number>;
  blockers: Task[];
  scope_creep_tasks: Task[];
  generated_at: string;
}

interface MemberDashboard {
  member_dashboard: {
    user_id: number;
    username: string;
    full_name: string;
    personal_stats: {
      user_id: number;
      username: string;
      full_name: string;
      email: string;
      total_tasks: number;
      completed_tasks: number;
      in_progress_tasks: number;
      overdue_tasks: number;
      completion_rate: number;
      avg_completion_time_hours: number;
      calendar_sync_rate: number;
      current_workload_hours: number;
      priority_breakdown: Record<string, number>;
      category_breakdown: Record<string, number>;
    };
    assigned_tasks: Task[];
    overdue_tasks: Task[];
    upcoming_deadlines: Task[];
    recent_completions: Task[];
    workload_by_project: any[];
    calendar_integration_status: any;
    weekly_productivity: Record<string, number>;
    recommendations: string[];
  };
  generated_at: string;
}

const TeamDetails = () => {
  const { teamId } = useParams<{ teamId: string }>();
  const { toast } = useToast();
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [sprintDashboard, setSprintDashboard] =
    useState<SprintDashboard | null>(null);
  const [memberDashboard, setMemberDashboard] =
    useState<MemberDashboard | null>(null);
  const [selectedMember, setSelectedMember] = useState<TeamMember | null>(null);
  const [loading, setLoading] = useState(true);
  const [dashboardLoading, setDashboardLoading] = useState(false);

  useEffect(() => {
    if (teamId) {
      fetchTeamMembers();
      fetchSprintDashboard();
    }
  }, [teamId]);

  const fetchTeamMembers = async () => {
    try {
      const response = await fetch(
        `https://team-sync-pro-nguyentrieu8.replit.app/teams/${teamId}`
      );
      if (response.ok) {
        const data = await response.json();
        setTeamMembers(data);
      } else {
        throw new Error("Failed to fetch team members");
      }
    } catch (error) {
      console.error("Error fetching team members:", error);
      toast({
        title: "Error",
        description: "Failed to fetch team members",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchSprintDashboard = async () => {
    setDashboardLoading(true);
    try {
      const response = await fetch(
        `https://team-sync-pro-nguyentrieu8.replit.app/dashboard/sprint/${teamId}`
      );
      if (response.ok) {
        const data = await response.json();
        setSprintDashboard(data);
        setMemberDashboard(null);
        setSelectedMember(null);
      } else {
        throw new Error("Failed to fetch sprint dashboard");
      }
    } catch (error) {
      console.error("Error fetching sprint dashboard:", error);
      toast({
        title: "Error",
        description: "Failed to fetch sprint dashboard",
        variant: "destructive",
      });
    } finally {
      setDashboardLoading(false);
    }
  };

  const fetchMemberDashboard = async (userId: number) => {
    setDashboardLoading(true);
    try {
      const response = await fetch(
        `https://team-sync-pro-nguyentrieu8.replit.app/dashboard/member/${userId}?team_id=${teamId}`
      );
      if (response.ok) {
        const data = await response.json();
        setMemberDashboard(data);
        setSprintDashboard(null);
      } else {
        throw new Error("Failed to fetch member dashboard");
      }
    } catch (error) {
      console.error("Error fetching member dashboard:", error);
      toast({
        title: "Error",
        description: "Failed to fetch member dashboard",
        variant: "destructive",
      });
    } finally {
      setDashboardLoading(false);
    }
  };

  const handleMemberClick = (member: TeamMember) => {
    setSelectedMember(member);
    fetchMemberDashboard(member.user_id);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "completed":
        return "bg-green-100 text-green-800";
      case "in_progress":
        return "bg-blue-100 text-blue-800";
      case "todo":
        return "bg-gray-100 text-gray-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority.toLowerCase()) {
      case "high":
        return "bg-red-100 text-red-800";
      case "medium":
        return "bg-yellow-100 text-yellow-800";
      case "low":
        return "bg-green-100 text-green-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">Loading team details...</div>
      </div>
    );
  }

  return (
    <div className="h-full flex">
      {/* Left Sidebar */}
      <div className="w-80 border-r bg-background p-6 overflow-y-auto">
        {/* Team Info Card */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Team Information
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <p>
                <span className="font-medium">Team ID:</span> {teamId}
              </p>
              <p>
                <span className="font-medium">Members:</span>{" "}
                {teamMembers.length}
              </p>
            </div>
            <Button
              onClick={fetchSprintDashboard}
              className="w-full mt-4"
              variant="outline"
            >
              <Target className="h-4 w-4 mr-2" />
              View Sprint Dashboard
            </Button>
          </CardContent>
        </Card>

        {/* Team Members List */}
        <Card>
          <CardHeader>
            <CardTitle>Team Members</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {teamMembers?.map((member) => (
                <div
                  key={member.id}
                  className={`p-3 rounded-lg border cursor-pointer hover:bg-accent transition-colors ${
                    selectedMember?.id === member.id ? "bg-accent" : ""
                  }`}
                  onClick={() => handleMemberClick(member)}
                >
                  <div className="flex items-center gap-3">
                    <Avatar>
                      <AvatarFallback>
                        {member.user.full_name
                          .split(" ")
                          .map((n) => n[0])
                          .join("")}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <p className="font-medium">{member.user.full_name}</p>
                      <p className="text-sm text-muted-foreground">
                        {member.user.username}
                      </p>
                      <Badge variant="outline" className="text-xs mt-1">
                        {member.role}
                      </Badge>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Dashboard Area */}
      <div className="flex-1 p-6 overflow-y-auto">
        {dashboardLoading && (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">Loading dashboard...</div>
          </div>
        )}

        {/* Sprint Dashboard */}
        {sprintDashboard && !dashboardLoading && (
          <div className="space-y-6">
            <div className="flex items-center gap-2 mb-6">
              <Target className="h-6 w-6" />
              <h1 className="text-2xl font-bold">Sprint Dashboard</h1>
            </div>

            {/* Sprint Stats */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">
                        Total Tasks
                      </p>
                      <p className="text-2xl font-bold">
                        {sprintDashboard.sprint_stats.total_tasks}
                      </p>
                    </div>
                    <Target className="h-8 w-8 text-muted-foreground" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">
                        Completed
                      </p>
                      <p className="text-2xl font-bold">
                        {sprintDashboard.sprint_stats.completed_tasks}
                      </p>
                    </div>
                    <TrendingUp className="h-8 w-8 text-green-600" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">
                        Completion Rate
                      </p>
                      <p className="text-2xl font-bold">
                        {sprintDashboard.sprint_stats.sprint_completion_rate}%
                      </p>
                    </div>
                    <Target className="h-8 w-8 text-blue-600" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">
                        Velocity
                      </p>
                      <p className="text-2xl font-bold">
                        {sprintDashboard.sprint_stats.velocity}
                      </p>
                    </div>
                    <TrendingUp className="h-8 w-8 text-purple-600" />
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Task Groups by Status</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid gap-6">
                  {(sprintDashboard.task_groups || []).map((group, index) => (
                    <div key={index} className="space-y-3">
                      <div className="flex items-center justify-between">
                        <h3 className="font-medium capitalize">
                          {group.status.replace("_", " ")}
                        </h3>
                        <Badge variant="outline">
                          {(group.tasks || []).length} tasks
                        </Badge>
                      </div>
                      <div className="space-y-2">
                        {(group.tasks || []).slice(0, 3).map((task) => (
                          <div key={task.id} className="p-3 border rounded-lg">
                            <div className="flex items-center justify-between">
                              <span className="font-medium">{task.title}</span>
                              <div className="flex gap-2">
                                <Badge className={getStatusColor(task.status)}>
                                  {task.status}
                                </Badge>
                                <Badge
                                  className={getPriorityColor(task.priority)}
                                >
                                  {task.priority}
                                </Badge>
                              </div>
                            </div>
                            <p className="text-sm text-muted-foreground mt-1">
                              Assigned to: {task.assignee_full_name}
                            </p>
                          </div>
                        ))}
                        {(group.tasks || []).length > 3 && (
                          <p className="text-sm text-muted-foreground">
                            +{(group.tasks || []).length - 3} more tasks...
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Blockers and Issues */}
            {((sprintDashboard.blockers || []).length > 0 ||
              (sprintDashboard.scope_creep_tasks || []).length > 0) && (
              <div className="grid md:grid-cols-2 gap-6">
                {(sprintDashboard.blockers || []).length > 0 && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2 text-red-600">
                        <AlertTriangle className="h-5 w-5" />
                        Blockers ({(sprintDashboard.blockers || []).length})
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        {(sprintDashboard.blockers || [])
                          .slice(0, 3)
                          .map((task) => (
                            <div
                              key={task.id}
                              className="p-3 border rounded-lg border-red-200"
                            >
                              <p className="font-medium">{task.title}</p>
                              <p className="text-sm text-muted-foreground">
                                {task.assignee_full_name}
                              </p>
                            </div>
                          ))}
                      </div>
                    </CardContent>
                  </Card>
                )}

                {(sprintDashboard.scope_creep_tasks || []).length > 0 && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2 text-orange-600">
                        <Clock className="h-5 w-5" />
                        Scope Creep (
                        {(sprintDashboard.scope_creep_tasks || []).length})
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        {(sprintDashboard.scope_creep_tasks || [])
                          .slice(0, 3)
                          .map((task) => (
                            <div
                              key={task.id}
                              className="p-3 border rounded-lg border-orange-200"
                            >
                              <p className="font-medium">{task.title}</p>
                              <p className="text-sm text-muted-foreground">
                                {task.assignee_full_name}
                              </p>
                            </div>
                          ))}
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>
            )}
          </div>
        )}

        {/* Member Dashboard */}
        {memberDashboard && !dashboardLoading && (
          <div className="space-y-6">
            <div className="flex items-center gap-2 mb-6">
              <Users className="h-6 w-6" />
              <h1 className="text-2xl font-bold">
                {memberDashboard.member_dashboard.full_name}'s Dashboard
              </h1>
            </div>

            {/* Personal Stats */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">
                        Total Tasks
                      </p>
                      <p className="text-2xl font-bold">
                        {
                          memberDashboard.member_dashboard.personal_stats
                            .total_tasks
                        }
                      </p>
                    </div>
                    <Target className="h-8 w-8 text-muted-foreground" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">
                        Completion Rate
                      </p>
                      <p className="text-2xl font-bold">
                        {
                          memberDashboard.member_dashboard.personal_stats
                            .completion_rate
                        }
                        %
                      </p>
                    </div>
                    <TrendingUp className="h-8 w-8 text-green-600" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">
                        Overdue Tasks
                      </p>
                      <p className="text-2xl font-bold">
                        {
                          memberDashboard.member_dashboard.personal_stats
                            .overdue_tasks
                        }
                      </p>
                    </div>
                    <AlertTriangle className="h-8 w-8 text-red-600" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">
                        Workload (hrs)
                      </p>
                      <p className="text-2xl font-bold">
                        {
                          memberDashboard.member_dashboard.personal_stats
                            .current_workload_hours
                        }
                      </p>
                    </div>
                    <Clock className="h-8 w-8 text-blue-600" />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Task Lists */}
            <div className="grid md:grid-cols-2 gap-6">
              {/* Assigned Tasks */}
              <Card>
                <CardHeader>
                  <CardTitle>
                    Assigned Tasks (
                    {
                      (memberDashboard.member_dashboard.assigned_tasks || [])
                        .length
                    }
                    )
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {(memberDashboard.member_dashboard.assigned_tasks || [])
                      .slice(0, 5)
                      .map((task) => (
                        <div key={task.id} className="p-3 border rounded-lg">
                          <div className="flex items-center justify-between">
                            <span className="font-medium">{task.title}</span>
                            <Badge className={getPriorityColor(task.priority)}>
                              {task.priority}
                            </Badge>
                          </div>
                          <div className="flex items-center gap-2 mt-1">
                            <Badge className={getStatusColor(task.status)}>
                              {task.status}
                            </Badge>
                            {task.due_date && (
                              <span className="text-xs text-muted-foreground">
                                Due: {formatDate(task.due_date)}
                              </span>
                            )}
                          </div>
                        </div>
                      ))}
                  </div>
                </CardContent>
              </Card>

              {/* Overdue Tasks */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-red-600">
                    Overdue Tasks (
                    {
                      (memberDashboard.member_dashboard.overdue_tasks || [])
                        .length
                    }
                    )
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {(memberDashboard.member_dashboard.overdue_tasks || [])
                      .slice(0, 5)
                      .map((task) => (
                        <div
                          key={task.id}
                          className="p-3 border rounded-lg border-red-200"
                        >
                          <div className="flex items-center justify-between">
                            <span className="font-medium">{task.title}</span>
                            <Badge className={getPriorityColor(task.priority)}>
                              {task.priority}
                            </Badge>
                          </div>
                          <div className="flex items-center gap-2 mt-1">
                            <Badge className="bg-red-100 text-red-800">
                              Overdue
                            </Badge>
                            <span className="text-xs text-muted-foreground">
                              {task.days_until_due} days overdue
                            </span>
                          </div>
                        </div>
                      ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            {(memberDashboard.member_dashboard.recommendations || []).length >
              0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Recommendations</CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {(
                      memberDashboard.member_dashboard.recommendations || []
                    ).map((recommendation, index) => (
                      <li key={index} className="flex items-start gap-2">
                        <div className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0" />
                        <span>{recommendation}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            )}
          </div>
        )}

        {/* Default state */}
        {!sprintDashboard && !memberDashboard && !dashboardLoading && (
          <div className="flex items-center justify-center h-full">
            <div className="text-center space-y-4">
              <Target className="h-16 w-16 text-muted-foreground mx-auto" />
              <h2 className="text-xl font-semibold">
                Welcome to Team Dashboard
              </h2>
              <p className="text-muted-foreground">
                Click on the team card to view sprint dashboard or select a team
                member to view their individual dashboard.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default TeamDetails;
