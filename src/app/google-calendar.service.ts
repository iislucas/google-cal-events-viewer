import { Injectable } from '@angular/core';
import { CalendarEvent } from './event.model'; // Import the interface
import {
  connectFunctionsEmulator,
  getFunctions,
  HttpsCallable,
  httpsCallable,
} from 'firebase/functions';
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
    const functions = getFunctions(app);

    connectFunctionsEmulator(functions, '127.0.0.1', 5001); // Use the port from emulator output

    this.getCalendarEvents = httpsCallable(functions, 'getCalendarEvents');
  }

  async getPublicCalendarEvents(calendarId: string): Promise<CalendarEvent[]> {
    console.log('getPublicCalendarEvents about to get events...', calendarId);
    const result = await this.getCalendarEvents({ calendarId });
    console.log('getPublicCalendarEvents result', result);
    const response = result.data as GoogleCalendarResponse | undefined;

    if (!response || !response.items) {
      return [];
    }

    return response.items.map((item) => this.mapGoogleCalendarEvent(item));
  }

  private mapGoogleCalendarEvent(item: GoogleCalendarEventItem): CalendarEvent {
    return {
      title: item.summary || 'No Title',
      start: item.start?.dateTime || item.start?.date || 'N/A',
      end: this.getEventEndDate(item.end),
      description: item.description || 'No description',
    };
  }

  private getEventEndDate(end?: { dateTime?: string; date?: string }): string {
    if (!end) {
      return 'N/A';
    }
    // For all-day events, Google Calendar returns the end date as the day after.
    // We need to subtract one day to get the correct end date.
    if (end.date && !end.dateTime) {
      const endDate = new Date(end.date);
      endDate.setDate(endDate.getDate() - 1);
      return endDate.toISOString().split('T')[0]; // Format as 'YYYY-MM-DD'
    }
    return end.dateTime || end.date || 'N/A';
  }
}
