import {
  Component,
  OnInit,
  signal,
  inject,
  ChangeDetectionStrategy,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms'; // Import FormsModule
import { ActivatedRoute, Router } from '@angular/router'; // Import ActivatedRoute and Router
import { GoogleCalendarService } from '../google-calendar.service';
import { CalendarEvent } from '../event.model'; // Import the interface

@Component({
  selector: 'app-event-list',
  standalone: true, // Ensure this is a standalone component
  imports: [CommonModule, FormsModule], // Add FormsModule here
  templateUrl: './event-list.component.html',
  styleUrl: './event-list.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class EventListComponent implements OnInit {
  events = signal<CalendarEvent[]>([]);
  errorMessage = signal<string | null>(null); // To display error messages
  inputCalendarId: string = '';
  showInputFields = signal(false);

  private googleCalendarService = inject(GoogleCalendarService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);

  ngOnInit(): void {
    this.route.queryParamMap.subscribe((params) => {
      const calendarId = params.get('calendarId');
      if (calendarId) {
        this.fetchEvents(calendarId);
        this.showInputFields.set(false);
      } else {
        this.showInputFields.set(true);
        this.errorMessage.set('Please provide Calendar ID to fetch events.');
      }
    });
  }

  async fetchEvents(calendarId: string): Promise<void> {
    this.errorMessage.set(null); // Clear any previous error messages
    try {
      const events = await this.googleCalendarService.getPublicCalendarEvents(
        calendarId
      );
      this.events.set(events);
      console.log('Fetched events:', this.events());
    } catch (err) {
      console.error('Error fetching calendar events:', err);
      this.errorMessage.set(
        'Error fetching calendar events. Please check the console for more details or verify your Calendar ID.'
      );
    }
  }

  submitParameters(): void {
    if (this.inputCalendarId) {
      this.router.navigate([], {
        relativeTo: this.route,
        queryParams: {
          calendarId: this.inputCalendarId,
        },
        queryParamsHandling: 'merge', // Merge with existing query params
      });
      // The subscription in ngOnInit will handle fetching events after navigation
      this.showInputFields.set(false);
    } else {
      this.errorMessage.set('Calendar ID is required.');
    }
  }
}
