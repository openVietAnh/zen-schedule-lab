import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CalendarDays, Clock, Target, TrendingUp, CheckCircle, AlertTriangle, X, Calendar } from "lucide-react";
import { Separator } from "@/components/ui/separator";

interface WeeklyReport {
  id: number;
  user_id: number;
  date_start: string;
  date_end: string;
  total_tasks: number;
  completed_tasks: number;
  overdue_tasks: number;
  cancelled_tasks: number;
  total_estimated_hours: number;
  completed_hours: number;
  high_priority_completed: number;
  high_priority_total: number;
  daily_completion_stats: string;
  ai_summary: string;
  ai_suggestions: string;
  ai_productivity_insights: string;
  status: string;
  created_at: string;
  updated_at: string;
}

const Reports = () => {
  const { serviceUser } = useAuth();
  const { toast } = useToast();
  const [report, setReport] = useState<WeeklyReport | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const getWeekDates = () => {
    const now = new Date();
    const currentDay = now.getDay();
    const mondayOffset = currentDay === 0 ? -6 : 1 - currentDay;
    
    const monday = new Date(now);
    monday.setDate(now.getDate() + mondayOffset);
    
    const sunday = new Date(monday);
    sunday.setDate(monday.getDate() + 6);
    
    return {
      start_date: monday.toISOString().split('T')[0],
      end_date: sunday.toISOString().split('T')[0]
    };
  };

  const fetchWeeklyReport = async () => {
    if (!serviceUser?.id) return;

    setIsLoading(true);
    try {
      const { start_date, end_date } = getWeekDates();
      const params = new URLSearchParams({
        user_id: serviceUser.id.toString(),
        report_type: "weekly",
        start_date,
        end_date
      });

      const response = await fetch(
        `https://team-sync-pro-nguyentrieu8.replit.app/weekly-reports/generate-demo?${params}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );

      if (!response.ok) {
        throw new Error('Failed to generate weekly report');
      }

      const data = await response.json();
      setReport(data);
    } catch (error) {
      console.error('Error fetching weekly report:', error);
      toast({
        title: "Error",
        description: "Failed to generate weekly report. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchWeeklyReport();
  }, [serviceUser?.id]);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const parseDailyStats = (statsString: string) => {
    try {
      return JSON.parse(statsString);
    } catch {
      return {};
    }
  };

  const parseSuggestions = (suggestionsString: string) => {
    try {
      const parsed = JSON.parse(suggestionsString);
      return Array.isArray(parsed) ? parsed : Object.values(parsed);
    } catch {
      return [];
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background p-6 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Generating weekly report...</p>
        </div>
      </div>
    );
  }

  if (!report) {
    return (
      <div className="min-h-screen bg-background p-6 flex items-center justify-center">
        <Card className="w-full max-w-md text-center">
          <CardContent className="pt-6">
            <CalendarDays className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No Report Available</h3>
            <p className="text-muted-foreground">Unable to generate weekly report at this time.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const dailyStats = parseDailyStats(report.daily_completion_stats);
  const suggestions = parseSuggestions(report.ai_suggestions);
  const completionRate = report.total_tasks > 0 ? (report.completed_tasks / report.total_tasks * 100) : 0;
  const highPriorityRate = report.high_priority_total > 0 ? (report.high_priority_completed / report.high_priority_total * 100) : 0;

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Weekly Report</h1>
            <p className="text-muted-foreground">
              {formatDate(report.date_start)} - {formatDate(report.date_end)}
            </p>
          </div>
          <Badge variant={report.status === 'completed' ? 'default' : 'secondary'} className="capitalize">
            {report.status}
          </Badge>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Tasks</CardTitle>
              <Target className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{report.total_tasks}</div>
              <p className="text-xs text-muted-foreground">
                {completionRate.toFixed(1)}% completion rate
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Completed</CardTitle>
              <CheckCircle className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{report.completed_tasks}</div>
              <p className="text-xs text-muted-foreground">
                {report.completed_hours}h completed
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Overdue</CardTitle>
              <AlertTriangle className="h-4 w-4 text-orange-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-orange-600">{report.overdue_tasks}</div>
              <p className="text-xs text-muted-foreground">
                Need attention
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Estimated Hours</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{report.total_estimated_hours}</div>
              <p className="text-xs text-muted-foreground">
                Total planned time
              </p>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* High Priority Tasks */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                High Priority Tasks
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Completed</span>
                  <span className="font-semibold">{report.high_priority_completed}/{report.high_priority_total}</span>
                </div>
                <div className="w-full bg-secondary rounded-full h-2">
                  <div 
                    className="bg-primary h-2 rounded-full transition-all duration-300" 
                    style={{ width: `${highPriorityRate}%` }}
                  />
                </div>
                <p className="text-sm text-muted-foreground">
                  {highPriorityRate.toFixed(1)}% of high priority tasks completed
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Daily Completion Stats */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Daily Activity
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {Object.entries(dailyStats).map(([day, count]) => {
                  const countValue = Number(count) || 0;
                  const maxValue = Math.max(...Object.values(dailyStats).map(v => Number(v) || 0));
                  return (
                    <div key={day} className="flex justify-between items-center">
                      <span className="text-sm capitalize">{day}</span>
                      <div className="flex items-center gap-2">
                        <div className="w-16 bg-secondary rounded-full h-2">
                          <div 
                            className="bg-primary h-2 rounded-full transition-all duration-300"
                            style={{ width: `${Math.min(countValue / Math.max(maxValue, 1) * 100, 100)}%` }}
                          />
                        </div>
                        <span className="text-sm font-medium w-8 text-right">{countValue}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* AI Summary and Insights */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>AI Summary</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm leading-relaxed">{report.ai_summary}</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Productivity Insights</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm leading-relaxed">{report.ai_productivity_insights}</p>
            </CardContent>
          </Card>
        </div>

        {/* AI Suggestions */}
        {suggestions.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>AI Suggestions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {suggestions.map((suggestion, index) => (
                  <div key={index} className="flex items-start gap-3 p-3 rounded-lg bg-muted/50">
                    <div className="flex-shrink-0 w-6 h-6 rounded-full bg-primary/10 text-primary text-xs flex items-center justify-center font-medium">
                      {index + 1}
                    </div>
                    <p className="text-sm leading-relaxed">{suggestion}</p>
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

export default Reports;