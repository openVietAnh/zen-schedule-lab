import { useState } from "react";
import { useAuth } from "./useAuth";

interface CalendarEvent {
  id: string;
  summary: string;
  description?: string;
  start: {
    dateTime: string;
    timeZone?: string;
  };
  end: {
    dateTime: string;
    timeZone?: string;
  };
  location?: string;
  attendees?: Array<{
    email: string;
    displayName?: string;
  }>;
}

interface CreateEventParams {
  summary: string;
  description?: string;
  startDateTime: string;
  endDateTime: string;
  location?: string;
  attendeeEmails?: string[];
}

export const useGoogleCalendar = () => {
  const { googleAccessToken } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const makeCalendarRequest = async (endpoint: string, options: RequestInit = {}) => {
    if (!googleAccessToken) {
      throw new Error("Google access token not available. Please authenticate first.");
    }

    const response = await fetch(`https://www.googleapis.com/calendar/v3${endpoint}`, {
      ...options,
      headers: {
        'Authorization': `Bearer ${googleAccessToken}`,
        'Content-Type': 'application/json',
        ...options.headers,
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error?.message || `Calendar API error: ${response.status}`);
    }

    return response.json();
  };

  const getCalendars = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const data = await makeCalendarRequest('/users/me/calendarList');
      return data.items || [];
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch calendars';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const getEvents = async (calendarId: string = 'primary', maxResults: number = 50) => {
    setLoading(true);
    setError(null);
    
    try {
      const now = new Date().toISOString();
      const data = await makeCalendarRequest(
        `/calendars/${encodeURIComponent(calendarId)}/events?timeMin=${now}&maxResults=${maxResults}&singleEvents=true&orderBy=startTime`
      );
      return data.items || [];
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch events';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const createEvent = async (params: CreateEventParams, calendarId: string = 'primary'): Promise<CalendarEvent> => {
    setLoading(true);
    setError(null);
    
    try {
      const event = {
        summary: params.summary,
        description: params.description,
        start: {
          dateTime: params.startDateTime,
          timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        },
        end: {
          dateTime: params.endDateTime,
          timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        },
        location: params.location,
        attendees: params.attendeeEmails?.map(email => ({ email })),
      };

      const data = await makeCalendarRequest(
        `/calendars/${encodeURIComponent(calendarId)}/events`,
        {
          method: 'POST',
          body: JSON.stringify(event),
        }
      );

      return data;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to create event';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const updateEvent = async (eventId: string, params: Partial<CreateEventParams>, calendarId: string = 'primary'): Promise<CalendarEvent> => {
    setLoading(true);
    setError(null);
    
    try {
      const event: any = {};
      
      if (params.summary) event.summary = params.summary;
      if (params.description) event.description = params.description;
      if (params.location) event.location = params.location;
      if (params.startDateTime) {
        event.start = {
          dateTime: params.startDateTime,
          timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        };
      }
      if (params.endDateTime) {
        event.end = {
          dateTime: params.endDateTime,
          timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        };
      }
      if (params.attendeeEmails) {
        event.attendees = params.attendeeEmails.map(email => ({ email }));
      }

      const data = await makeCalendarRequest(
        `/calendars/${encodeURIComponent(calendarId)}/events/${encodeURIComponent(eventId)}`,
        {
          method: 'PUT',
          body: JSON.stringify(event),
        }
      );

      return data;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update event';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const deleteEvent = async (eventId: string, calendarId: string = 'primary') => {
    setLoading(true);
    setError(null);
    
    try {
      await makeCalendarRequest(
        `/calendars/${encodeURIComponent(calendarId)}/events/${encodeURIComponent(eventId)}`,
        {
          method: 'DELETE',
        }
      );
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to delete event';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return {
    loading,
    error,
    isAvailable: !!googleAccessToken,
    getCalendars,
    getEvents,
    createEvent,
    updateEvent,
    deleteEvent,
  };
};