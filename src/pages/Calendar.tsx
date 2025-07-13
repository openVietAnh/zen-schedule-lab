import { Calendar as CalendarIcon, ChevronLeft, ChevronRight, Plus } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";

interface CalendarEvent {
  id: string;
  title: string;
  description: string;
  start_time: string;
  end_time: string;
  color_id: string;
}

const Calendar = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [loading, setLoading] = useState(false);
  const { serviceUser, serviceAccessToken } = useAuth();

  const fetchEvents = async (startDate: Date, endDate: Date) => {
    if (!serviceUser?.id || !serviceAccessToken) {
      return;
    }

    setLoading(true);
    try {
      const startDateISO = startDate.toISOString().split('T')[0];
      const endDateISO = endDate.toISOString().split('T')[0];
      
      const response = await fetch(
        `https://team-sync-pro-nguyentrieu8.replit.app/calendar/events?user_id=${serviceUser.id}&start_date=${startDateISO}&end_date=${endDateISO}`,
        {
          headers: {
            Authorization: `Bearer ${serviceAccessToken}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error("Failed to fetch events");
      }

      const data = await response.json();
      setEvents(data);
    } catch (error) {
      toast.error("Failed to load calendar events");
      console.error("Error fetching events:", error);
    } finally {
      setLoading(false);
    }
  };

  const getEventsForDate = (date: Date) => {
    const dateStr = date.toISOString().split('T')[0];
    return events.filter(event => {
      const eventDate = new Date(event.start_time).toISOString().split('T')[0];
      return eventDate === dateStr;
    });
  };

  const hasEventsOnDate = (day: number) => {
    const date = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
    return getEventsForDate(date).length > 0;
  };

  const monthNames = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];

  const daysInMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).getDate();
  const firstDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1).getDay();
  
  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);
  const emptyDays = Array.from({ length: firstDayOfMonth }, (_, i) => i);

  const navigateMonth = (direction: 'prev' | 'next') => {
    const newDate = new Date(currentDate);
    if (direction === 'prev') {
      newDate.setMonth(currentDate.getMonth() - 1);
    } else {
      newDate.setMonth(currentDate.getMonth() + 1);
    }
    setCurrentDate(newDate);
  };

  const handleDateClick = (day: number) => {
    const clickedDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
    setSelectedDate(clickedDate);
  };

  useEffect(() => {
    if (serviceUser?.id && serviceAccessToken) {
      const startOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
      const endOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);
      fetchEvents(startOfMonth, endOfMonth);
    }
  }, [currentDate, serviceUser?.id, serviceAccessToken]);

  const today = new Date();
  const isToday = (day: number) => {
    return (
      day === today.getDate() &&
      currentDate.getMonth() === today.getMonth() &&
      currentDate.getFullYear() === today.getFullYear()
    );
  };

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <CalendarIcon className="h-6 w-6 text-primary" />
            <h1 className="text-3xl font-bold text-foreground">Calendar</h1>
          </div>
          <Button className="flex items-center gap-2">
            <Plus className="h-4 w-4" />
            New Event
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Calendar Grid */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-xl">
                    {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
                  </CardTitle>
                  <div className="flex items-center gap-2">
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => navigateMonth('prev')}
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => navigateMonth('next')}
                    >
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-7 gap-1 mb-4">
                  {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                    <div key={day} className="p-2 text-center text-sm font-medium text-muted-foreground">
                      {day}
                    </div>
                  ))}
                </div>
                
                <div className="grid grid-cols-7 gap-1">
                  {emptyDays.map(day => (
                    <div key={`empty-${day}`} className="p-2 h-12" />
                  ))}
                  
                  {days.map(day => (
                    <div 
                      key={day}
                      className={`p-2 h-12 border rounded cursor-pointer hover:bg-muted/50 transition-colors relative ${
                        isToday(day) ? 'bg-primary text-primary-foreground' : 'border-border'
                      }`}
                      onClick={() => handleDateClick(day)}
                    >
                      <div className="text-sm font-medium">{day}</div>
                      {hasEventsOnDate(day) && (
                        <div className="absolute bottom-1 right-1 w-2 h-2 bg-primary rounded-full"></div>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Events for Selected Date */}
          <div>
            <Card>
              <CardHeader>
                <CardTitle>
                  {selectedDate 
                    ? `Events for ${selectedDate.toLocaleDateString()}` 
                    : "Select a date to view events"
                  }
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {loading ? (
                  <div className="text-center text-muted-foreground">Loading events...</div>
                ) : selectedDate ? (
                  getEventsForDate(selectedDate).length > 0 ? (
                    getEventsForDate(selectedDate).map((event) => (
                      <div key={event.id} className="space-y-2">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <h4 className="font-medium">{event.title}</h4>
                            <p className="text-sm text-muted-foreground">
                              {event.description}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {new Date(event.start_time).toLocaleTimeString([], {
                                hour: '2-digit',
                                minute: '2-digit'
                              })} - {new Date(event.end_time).toLocaleTimeString([], {
                                hour: '2-digit',
                                minute: '2-digit'
                              })}
                            </p>
                          </div>
                        </div>
                        {event.id !== getEventsForDate(selectedDate)[getEventsForDate(selectedDate).length - 1].id && (
                          <div className="border-b border-border" />
                        )}
                      </div>
                    ))
                  ) : (
                    <div className="text-center text-muted-foreground">No events on this date</div>
                  )
                ) : (
                  <div className="text-center text-muted-foreground">Click on a date to view events</div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Calendar;