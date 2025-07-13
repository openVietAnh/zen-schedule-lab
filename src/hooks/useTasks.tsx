import { useState, useEffect } from "react";
import { useAuth } from "./useAuth";

export interface Task {
  id: number;
  title: string;
  description: string | null;
  project_id: number | null;
  assignee_id: number | null;
  parent_task_id: number | null;
  status: "todo" | "in_progress" | "done" | "cancelled";
  priority: "low" | "medium" | "high" | "urgent";
  due_date: string | null;
  creator_id: number;
  ai_category: string | null;
  ai_estimated_hours: number | null;
  completed_at: string | null;
  created_at: string;
  updated_at: string;
}

export const useTasks = () => {
  const { serviceUser, serviceAccessToken } = useAuth();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [skip, setSkip] = useState(0);
  const limit = 10;

  const fetchTasks = async () => {
    if (!serviceUser?.id || !serviceAccessToken) return;

    setLoading(true);
    setError(null);

    try {
      const url = new URL('https://team-sync-pro-nguyentrieu8.replit.app/tasks');
      url.searchParams.append('skip', skip.toString());
      url.searchParams.append('limit', limit.toString());
      url.searchParams.append('assignee_id', serviceUser.id);
      // project_id and status are set to null as requested

      const response = await fetch(url.toString(), {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${serviceAccessToken}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch tasks');
      }

      const data = await response.json();
      
      if (skip === 0) {
        setTasks(data);
      } else {
        setTasks(prev => [...prev, ...data]);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  const refreshTasks = () => {
    setSkip(0);
    setTasks([]);
  };

  const loadMore = () => {
    setSkip(prev => prev + limit);
  };

  const toggleTaskStatus = async (taskId: number) => {
    const task = tasks.find(t => t.id === taskId);
    if (!task) return;

    const newStatus = task.status === 'done' ? 'todo' : 'done';
    
    setTasks(prev =>
      prev.map(t =>
        t.id === taskId
          ? { ...t, status: newStatus, completed_at: newStatus === 'done' ? new Date().toISOString() : null }
          : t
      )
    );
  };

  useEffect(() => {
    fetchTasks();
  }, [serviceUser?.id, serviceAccessToken, skip]);

  return {
    tasks,
    loading,
    error,
    refreshTasks,
    loadMore,
    toggleTaskStatus,
    hasMore: tasks.length % limit === 0 && tasks.length > 0
  };
};