import {
  Component,
  OnInit,
  signal,
  inject,
  ChangeDetectionStrategy,
  computed,
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
  searchTerm = signal('');
  searchField = signal('all');
  filteredEvents = signal<CalendarEvent[]>([]);

  private googleCalendarService = inject(GoogleCalendarService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);

  ngOnInit(): void {
    this.route.queryParamMap.subscribe((params) => {
      const calendarId = params.get('calendarId');
      const q = params.get('q');
      if (calendarId) {
        this.searchTerm.set(q || '');
        this.fetchEvents(calendarId, q);
        this.showInputFields.set(false);
      } else {
        this.showInputFields.set(true);
        this.errorMessage.set('Please provide Calendar ID to fetch events.');
      }
    });
  }

  async fetchEvents(calendarId: string, q: string | null): Promise<void> {
    this.errorMessage.set(null); // Clear any previous error messages
    try {
      const events = await this.googleCalendarService.getPublicCalendarEvents(
        calendarId,
        q || undefined
      );
      this.events.set(events);
      this.filterEvents(); // Filter events after fetching
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

  onSearch(): void {
    // Update the URL to reflect the search term.
    // The subscription in ngOnInit will handle fetching events.
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: {
        q: this.searchTerm() || null,
      },
      queryParamsHandling: 'merge',
    });
  }

  private filterEvents(): void {
    const term = this.searchTerm().toLowerCase();
    const field = this.searchField();
    const events = this.events();

    if (!term) {
      this.filteredEvents.set(events);
      return;
    }

    const filtered = events.filter((event) => {
      if (field === 'all') {
        return (
          event.title.toLowerCase().includes(term) ||
          event.description.toLowerCase().includes(term) ||
          (event.location && event.location.toLowerCase().includes(term))
        );
      } else if (field === 'title') {
        return event.title.toLowerCase().includes(term);
      } else if (field === 'description') {
        return event.description.toLowerCase().includes(term);
      } else if (field === 'location') {
        return event.location
          ? event.location.toLowerCase().includes(term)
          : false;
      }
      return false;
    });
    this.filteredEvents.set(filtered);
  }
}
