import { useState, useEffect } from "react";
import { Activity, TrendingUp, Clock, AlertTriangle, CheckCircle, Calendar } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";

interface PersonalStats {
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
}

interface DashboardTask {
  id: number;
  title: string;
  assignee_username: string;
  assignee_full_name: string;
  status: "todo" | "in_progress" | "completed";
  priority: "low" | "medium" | "high";
  ai_category: string;
  ai_estimated_hours: number;
  due_date: string;
  days_until_due: number;
  is_overdue: boolean;
  calendar_sync_status: "pending" | "synced" | "failed";
  created_at: string;
  completed_at: string | null;
}

interface MemberDashboardData {
  member_dashboard: {
    user_id: number;
    username: string;
    full_name: string;
    personal_stats: PersonalStats;
    assigned_tasks: DashboardTask[];
    overdue_tasks: DashboardTask[];
    upcoming_deadlines: DashboardTask[];
    recent_completions: DashboardTask[];
    workload_by_project: Record<string, any>[];
    calendar_integration_status: Record<string, any>;
    weekly_productivity: Record<string, number>;
    recommendations: string[];
  };
  generated_at: string;
}

export const MemberDashboard = () => {
  const { serviceUser, serviceAccessToken } = useAuth();
  const { toast } = useToast();
  const [dashboardData, setDashboardData] = useState<MemberDashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchDashboardData = async () => {
    if (!serviceUser?.id || !serviceAccessToken) return;
    
    try {
      const response = await fetch(`https://team-sync-pro-nguyentrieu8.replit.app/dashboard/member/${serviceUser.id}`, {
        headers: {
          Authorization: `Bearer ${serviceAccessToken}`,
        },
      });
      
      if (response.ok) {
        const data = await response.json();
        setDashboardData(data);
      } else {
        throw new Error("Failed to fetch dashboard data");
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load dashboard data",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, [serviceUser?.id, serviceAccessToken]);

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

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            Member Dashboard
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">Loading dashboard...</div>
        </CardContent>
      </Card>
    );
  }

  if (!dashboardData) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            Member Dashboard
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            Dashboard data not available
          </div>
        </CardContent>
      </Card>
    );
  }

  const { personal_stats, assigned_tasks, overdue_tasks, upcoming_deadlines, recent_completions, recommendations } = dashboardData.member_dashboard;

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            Member Dashboard
          </CardTitle>
        </CardHeader>
        <CardContent>
          {/* Stats Overview */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div className="text-center p-4 bg-muted/50 rounded-lg">
              <div className="text-2xl font-bold text-primary">{personal_stats.total_tasks}</div>
              <div className="text-sm text-muted-foreground">Total Tasks</div>
            </div>
            <div className="text-center p-4 bg-muted/50 rounded-lg">
              <div className="text-2xl font-bold text-green-600">{personal_stats.completed_tasks}</div>
              <div className="text-sm text-muted-foreground">Completed</div>
            </div>
            <div className="text-center p-4 bg-muted/50 rounded-lg">
              <div className="text-2xl font-bold text-blue-600">{personal_stats.in_progress_tasks}</div>
              <div className="text-sm text-muted-foreground">In Progress</div>
            </div>
            <div className="text-center p-4 bg-muted/50 rounded-lg">
              <div className="text-2xl font-bold text-red-600">{personal_stats.overdue_tasks}</div>
              <div className="text-sm text-muted-foreground">Overdue</div>
            </div>
          </div>

          {/* Progress Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">Completion Rate</span>
                <span className="text-sm text-muted-foreground">{Math.round(personal_stats.completion_rate)}%</span>
              </div>
              <Progress value={personal_stats.completion_rate} className="h-2" />
            </div>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">Calendar Sync Rate</span>
                <span className="text-sm text-muted-foreground">{Math.round(personal_stats.calendar_sync_rate)}%</span>
              </div>
              <Progress value={personal_stats.calendar_sync_rate} className="h-2" />
            </div>
          </div>

          {/* Additional Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
              <Clock className="h-5 w-5 text-blue-600" />
              <div>
                <div className="text-sm font-medium">Avg. Completion Time</div>
                <div className="text-sm text-muted-foreground">{personal_stats.avg_completion_time_hours.toFixed(1)} hours</div>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
              <TrendingUp className="h-5 w-5 text-green-600" />
              <div>
                <div className="text-sm font-medium">Current Workload</div>
                <div className="text-sm text-muted-foreground">{personal_stats.current_workload_hours} hours</div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Task Sections */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Overdue Tasks */}
        {overdue_tasks.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-red-600">
                <AlertTriangle className="h-5 w-5" />
                Overdue Tasks ({overdue_tasks.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {overdue_tasks.slice(0, 5).map((task) => (
                  <div key={task.id} className="flex items-center justify-between p-3 bg-red-50 dark:bg-red-950/20 rounded-lg">
                    <div className="flex-1">
                      <div className="font-medium text-sm">{task.title}</div>
                      <div className="text-xs text-muted-foreground">
                        Due: {new Date(task.due_date).toLocaleDateString()}
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Badge variant={getPriorityColor(task.priority)} className="text-xs">
                        {task.priority}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Upcoming Deadlines */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Upcoming Deadlines ({upcoming_deadlines.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {upcoming_deadlines.slice(0, 5).map((task) => (
                <div key={task.id} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                  <div className="flex-1">
                    <div className="font-medium text-sm">{task.title}</div>
                    <div className="text-xs text-muted-foreground">
                      Due in {task.days_until_due} days
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Badge variant={getPriorityColor(task.priority)} className="text-xs">
                      {task.priority}
                    </Badge>
                    <Badge variant={getStatusColor(task.status)} className="text-xs">
                      {task.status.replace('_', ' ')}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Recent Completions */}
        {recent_completions.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-green-600">
                <CheckCircle className="h-5 w-5" />
                Recent Completions ({recent_completions.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {recent_completions.slice(0, 5).map((task) => (
                  <div key={task.id} className="flex items-center justify-between p-3 bg-green-50 dark:bg-green-950/20 rounded-lg">
                    <div className="flex-1">
                      <div className="font-medium text-sm">{task.title}</div>
                      <div className="text-xs text-muted-foreground">
                        Completed: {task.completed_at ? new Date(task.completed_at).toLocaleDateString() : 'N/A'}
                      </div>
                    </div>
                    <Badge variant={getPriorityColor(task.priority)} className="text-xs">
                      {task.priority}
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Recommendations */}
        {recommendations.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                Recommendations
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {recommendations.map((recommendation, index) => (
                  <div key={index} className="p-3 bg-blue-50 dark:bg-blue-950/20 rounded-lg">
                    <div className="text-sm">{recommendation}</div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};