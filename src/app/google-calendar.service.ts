import { Injectable } from '@angular/core';
import { CalendarEvent } from './event.model'; // Import the interface
import { getFunctions, HttpsCallable, httpsCallable } from 'firebase/functions';
import { initializeApp } from 'firebase/app';
import { getAnalytics } from 'firebase/analytics';
import { environment } from '../environments/environment';

// Define interfaces for the Google Calendar API response
interface GoogleCalendarEventItem {
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
}
interface GoogleCalendarResponse {
  items?: GoogleCalendarEventItem[];
}

@Injectable({
  providedIn: 'root',
})
export class GoogleCalendarService {
  getCalendarEvents: HttpsCallable<
    { calendarId: string },
    GoogleCalendarResponse
  >;

  constructor() {
    // Initialize Firebase
    const app = initializeApp(environment.firebase);
    const analytics = getAnalytics(app);
    const functions = getFunctions();
    this.getCalendarEvents = httpsCallable(functions, 'getCalendarEvents');
  }

  async getPublicCalendarEvents(calendarId: string): Promise<CalendarEvent[]> {
    // TODO: update to using this way of calling the calendar API, as specified in /functions/src/index.ts
    return this.getCalendarEvents({ calendarId }).then((result) => {
      const response = result.data as GoogleCalendarResponse | undefined;
      if (!response || !response.items) {
        return [];
      }
      return response.items.map((item: GoogleCalendarEventItem) => {
        // console.log(item);
        return {
          title: item.summary || 'No Title',
          start: item.start ? item.start.dateTime || item.start.date : 'N/A',
          end: (() => {
            if (item.end && item.end.date && !item.end.dateTime) {
              const endDate = new Date(item.end.date);
              endDate.setDate(endDate.getDate() - 1);
              return endDate.toISOString().split('T')[0]; // Format as 'YYYY-MM-DD'
            }
            return item.end ? item.end.dateTime || item.end.date : 'N/A';
          })(),
          description: item.description || 'No description',
        } as CalendarEvent;
      });
    });
  }
}
