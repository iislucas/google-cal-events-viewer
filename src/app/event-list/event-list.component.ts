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
import { ActivatedRoute, Router } from '@angular/router';
import { GoogleCalendarService } from '../google-calendar.service';
import { CalendarEvent } from '../event.model';
import MiniSearch from 'minisearch';
import { EventItemComponent } from '../event-item/event-item.component';

/**
 * A type representing a calendar event that can be indexed by MiniSearch.
 * It includes a numeric `id` field required by the library.
 */
type SearchableCalendarEvent = CalendarEvent & { id: number };

@Component({
  selector: 'app-event-list',
  standalone: true,
  imports: [CommonModule, FormsModule, EventItemComponent],
  templateUrl: './event-list.component.html',
  styleUrl: './event-list.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class EventListComponent implements OnInit {
  // --- Component State Signals ---
  private allEvents = signal<SearchableCalendarEvent[]>([]);
  errorMessage = signal<string | null>(null);
  showInputFields = signal(false);
  inputCalendarId: string = '';

  // This signal is bound to the search input field and updates on every keystroke.
  searchInput = signal('');
  // This signal holds the value of the submitted search term.
  private searchTerm = signal('');

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
    const term = this.searchTerm().trim().toLowerCase();
    const events = this.allEvents();

    if (!term) {
      return { matched: events, unmatched: [] };
    }

    const results = this.miniSearch.search(term, { prefix: true, fuzzy: 0.2 });
    const matchedIds = new Set(results.map((r) => r.id));
    const matched = results as unknown as SearchableCalendarEvent[];
    const unmatched = events.filter((event) => !matchedIds.has(event.id));

    return { matched, unmatched };
  });

  constructor() {
    this.miniSearch = new MiniSearch<SearchableCalendarEvent>({
      fields: ['title', 'description', 'location'],
      storeFields: [
        'id',
        'title',
        'start',
        'end',
        'description',
        'location',
        'googleMapsUrl',
        'htmlLink',
      ],
      idField: 'id',
    });
  }

  ngOnInit(): void {
    this.route.queryParamMap.subscribe((params) => {
      const calendarId = params.get('calendarId');
      if (calendarId) {
        const q = params.get('q');
        this.searchInput.set(q || '');
        this.searchTerm.set(q || ''); // Set initial search term from URL
        this.fetchEvents(calendarId);
        this.showInputFields.set(false);
      } else {
        this.showInputFields.set(true);
        this.errorMessage.set('Please provide a Calendar ID to fetch events.');
      }
    });
  }

  async fetchEvents(calendarId: string): Promise<void> {
    this.errorMessage.set(null);
    try {
      const events = await this.googleCalendarService.getPublicCalendarEvents(
        calendarId
      );
      const eventsWithId = events.map((event, index) => ({
        ...event,
        id: index,
      }));
      this.allEvents.set(eventsWithId);

      this.miniSearch.removeAll();
      this.miniSearch.addAll(eventsWithId);
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
          q: null,
        },
        queryParamsHandling: 'merge',
      });
    } else {
      this.errorMessage.set('Calendar ID is required.');
    }
  }

  /**
   * This method is called when the search form is submitted.
   * It updates the `searchTerm` signal, which triggers the `searchResults` computed signal.
   * It also updates the URL with the new search query.
   */
  onSearch(): void {
    this.searchTerm.set(this.searchInput());
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: { q: this.searchInput() || null },
      queryParamsHandling: 'merge',
    });
  }
}
