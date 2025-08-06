export type GetCalendarEventsRequest = { calendarId: string; q?: string };

// Define interfaces for the Google Calendar API response
export type GoogleCalendarEventItem = {
  summary?: string;
  start?: {
    dateTime?: string;
    date?: string;
  };
  end?: {
    dateTime?: string;
    date?: string;
  };
  description?: string;
  location?: string;
  htmlLink: string;
};
export type GoogleCalendarResponse = {
  items?: GoogleCalendarEventItem[];
};
