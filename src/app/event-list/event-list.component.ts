import {
  Component,
  OnInit,
  signal,
  inject,
  ChangeDetectionStrategy,
  computed,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { ActivatedRoute, Router } from '@angular/router';
import { GoogleCalendarService } from '../google-calendar.service';
import { CalendarEvent } from '../event.model';
import MiniSearch from 'minisearch';
import { EventItemComponent } from '../event-item/event-item.component';
import { MAT_FORM_FIELD_DEFAULT_OPTIONS } from '@angular/material/form-field';

/**
 * A type representing a calendar event that can be indexed by MiniSearch.
 * It includes a numeric `id` field required by the library.
 */
type SearchableCalendarEvent = CalendarEvent & { id: string };

@Component({
  selector: 'app-event-list',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    EventItemComponent,
    MatInputModule,
    MatButtonModule,
    MatProgressSpinnerModule,
    MatIconModule,
  ],
  providers: [
    {
      provide: MAT_FORM_FIELD_DEFAULT_OPTIONS,
      useValue: { subscriptSizing: 'dynamic' },
    },
  ],
  templateUrl: './event-list.component.html',
  styleUrl: './event-list.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class EventListComponent implements OnInit {
  // --- Component State Signals ---
  private allEvents = signal<SearchableCalendarEvent[]>([]);
  errorMessage = signal<string | null>(null);
  isLoading = signal(false);
  needCalendarId = signal(true);
  inputCalendarId = signal('');
  inputServerSideSearch: string = '';

  // This signal is bound to the search input field and updates on every keystroke.
  searchInput = signal('');
  // This signal holds the value of the submitted search term for client-side filtering.
  private clientSideSearch = signal('');
  // This signal holds the value of the submitted search term for server-side searching.
  private serverSideSearch = signal('');

  // --- Injected Dependencies ---
  private googleCalendarService = inject(GoogleCalendarService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);

  // --- Full-text Search Implementation ---
  private miniSearch: MiniSearch<SearchableCalendarEvent>;

  /**
   * A computed signal that reactively filters events based on the submitted search term.
   * It separates the events into two lists: those that match the search query
   * and those that do not.
   */
  readonly searchResults = computed(() => {
    const term = this.searchInput().trim().toLowerCase();
    const events = this.allEvents();

    if (!term) {
      return { matched: events, unmatched: [] };
    }

    const results = this.miniSearch.search(term, {
      prefix: true,
      fuzzy: 0.01,
    });
    const matchedIds = new Set(results.map((r) => r.id));
    const matched = events.filter((event) => matchedIds.has(event.id));
    const unmatched = events.filter((event) => !matchedIds.has(event.id));
    return { matched, unmatched };
  });

  constructor() {
    this.miniSearch = new MiniSearch<SearchableCalendarEvent>({
      fields: ['title', 'location', 'start', 'end'],
      storeFields: [
        'id',
        'title',
        'start',
        'end',
        'location',
        'description',
        'googleMapsUrl',
        'htmlLink',
      ],
      idField: 'id',
    });
  }

  ngOnInit(): void {
    this.route.queryParamMap.subscribe((params) => {
      const calendarId = params.get('calendarId');
      let refetch = false;
      if (calendarId && calendarId !== this.inputCalendarId()) {
        refetch = true;
      }
      if (calendarId) {
        this.inputCalendarId.set(calendarId);
        const serverQuery = params.get('q') || '';
        const clientQuery = params.get('client_q') || '';
        this.serverSideSearch.set(serverQuery);
        this.searchInput.set(clientQuery);
        this.clientSideSearch.set(clientQuery);
        if (refetch) {
          this.fetchEvents(calendarId, serverQuery);
        }
      } else {
        this.errorMessage.set('Please provide a Calendar ID to fetch events.');
      }
    });
  }

  async fetchEvents(calendarId: string, query?: string): Promise<void> {
    this.errorMessage.set(null);
    this.isLoading.set(true);
    this.needCalendarId.set(false);
    try {
      const events = await this.googleCalendarService.getPublicCalendarEvents(
        calendarId,
        query
      );
      const eventsWithId = events.map((event, index) => ({
        ...event,
        id: `${index}`,
      }));
      this.allEvents.set(eventsWithId);

      this.miniSearch.removeAll();
      this.miniSearch.addAll(eventsWithId);
    } catch (err) {
      console.error('Error fetching calendar events:', err);
      this.needCalendarId.set(true);
      this.errorMessage.set(
        'Error fetching calendar events. Please check the console for more details or verify your Calendar ID.'
      );
    } finally {
      this.isLoading.set(false);
    }
  }

  /**
   * Handles the `ngModelChange` event from the search input field.
   * It updates the `searchInput` signal and triggers a search if the input is cleared.
   * @param value The new value of the input field.
   */
  onSearchInputChange(value: string): void {
    this.searchInput.set(value);
    this.clientSideSearch.set(value);
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: { client_q: value || null },
      queryParamsHandling: 'merge',
    });
  }

  submitParameters(): void {
    if (this.inputCalendarId()) {
      this.router.navigate([], {
        relativeTo: this.route,
        queryParams: {
          calendarId: this.inputCalendarId(),
          q: this.inputServerSideSearch || null,
        },
        queryParamsHandling: 'merge',
      });

      this.fetchEvents(this.inputCalendarId(), this.serverSideSearch());
    } else {
      this.errorMessage.set('Calendar ID is required.');
    }
  }
}
