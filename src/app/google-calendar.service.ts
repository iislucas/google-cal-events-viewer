import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { CalendarEvent } from './event.model'; // Import the interface

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
  private readonly BASE_URL =
    'https://www.googleapis.com/calendar/v3/calendars';

  constructor(private http: HttpClient) {}

  getPublicCalendarEvents(
    calendarId: string,
    apiKey: string
  ): Observable<CalendarEvent[]> {
    // Using Google Calendar API v3 endpoint
    // 'singleEvents=true' expands recurring events into individual instances.
    // 'orderBy=startTime' sorts events by their start time.
    // 'timeMin' can be used to filter future events, setting it to now.
    const now = new Date().toISOString();
    const url = `${this.BASE_URL}/${calendarId}/events?key=${apiKey}&singleEvents=true&orderBy=startTime&timeMin=${now}&maxResults=100`;

    return this.http.get(url).pipe(
      map((response: GoogleCalendarResponse) => {
        // The structure for the v3 API is typically under response.items
        if (response && response.items) {
          return response.items.map((item: GoogleCalendarEventItem) => {
            // console.log(item);
            return {
              title: item.summary || 'No Title',
              start: item.start
                ? item.start.dateTime || item.start.date
                : 'N/A',
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
        }
        return [];
      })
    );
  }
}
