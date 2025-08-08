import {
  Component,
  signal,
  inject,
  ChangeDetectionStrategy,
  computed,
  input,
  Output,
  EventEmitter,
  effect,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { GoogleCalendarService } from '../google-calendar.service';
import { CalendarEvent } from '../event.model';
import MiniSearch from 'minisearch';
import { EventItemComponent } from '../event-item/event-item.component';

import { IconComponent } from '../icons/icon.component';
function quotedFilter(result: CalendarEvent, quoted: string[]): boolean {
  // If there are no quoted terms, all results from MiniSearch are valid.
  if (quoted.length === 0) {
    return true;
  }

  // For a result to be valid, it must contain all of the quoted terms.
  const title = result.title.toLowerCase();
  const location = result.location?.toLowerCase() || '';
  const start = result.start?.toLowerCase() || '';
  const end = result.end?.toLowerCase() || '';
  return quoted.every((q) => {
    // console.log({ title, location, start, end });
    // console.log('query:', q);
    return (
      start.toLowerCase().includes(q) ||
      end.toLowerCase().includes(q) ||
      title.toLowerCase().includes(q) ||
      location.toLowerCase().includes(q)
    );
  });
}

/**
 * A type representing a calendar event that can be indexed by MiniSearch.
 * It includes a numeric `id` field required by the library.
 */
type SearchableCalendarEvent = CalendarEvent & { id: string };

@Component({
  selector: 'app-event-list',
  standalone: true,
  imports: [CommonModule, FormsModule, EventItemComponent, IconComponent],
  providers: [],
  templateUrl: './event-list.component.html',
  styleUrl: './event-list.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class EventListComponent {
  // --- Component State Signals ---
  private allEvents = signal<SearchableCalendarEvent[]>([]);
  errorMessage = signal<string | null>(null);
  isLoading = signal(false);
  needCalendarId = signal(true);
  inputCalendarId = signal('');

  // This signal is bound to the search input field and updates on every keystroke.
  searchInput = signal('');
  // This signal holds the value of the submitted search term for client-side filtering.
  private clientSideSearch = signal('');
  // This signal holds the value of the submitted search term for server-side searching.
  serverSideSearch = signal('');
  private usedCalendarId = signal('');

  // --- Injected Dependencies ---
  private googleCalendarService = inject(GoogleCalendarService);

  // --- Component Inputs ---
  calendarId = input<string>();
  serverSideSearchQuery = input<string>();
  clientSideSearchQuery = input<string>();

  // --- Component Outputs ---
  @Output() clientSideSearchChange = new EventEmitter<string>();
  @Output() serverSideSearchChange = new EventEmitter<string>();
  @Output() calendarIdChange = new EventEmitter<string>();

  // --- Full-text Search Implementation ---
  private miniSearch: MiniSearch<SearchableCalendarEvent>;

  /**
   * A computed signal that reactively filters events based on the submitted search term.
   * It separates the events into two lists: those that match the search query
   * and those that do not.
   */
  readonly searchResults = computed(() => {
    const term = this.searchInput().trim();
    const events = this.allEvents();

    if (!term) {
      return { matched: events, unmatched: [] };
    }

    const { quoted, nonQuoted } = this.parseSearchTerm(term);
    // console.log('quoted', quoted);
    // console.log('nonQuoted', nonQuoted);

    // If there's nothing to search for, return all events.
    if (!nonQuoted && quoted.length === 0) {
      return { matched: events, unmatched: [] };
    }

    let matchedIds: Set<string>;

    // If there are only quoted strings, search them only.
    if (nonQuoted.trim() === '') {
      matchedIds = new Set(
        events
          .filter((result) => quotedFilter(result, quoted))
          .map((event) => event.id)
      );
    } else {
      // search non-quoted, and then filter by quoted.
      const results = this.miniSearch.search(nonQuoted, {
        prefix: true,
        fuzzy: 0.01,
        filter: (result) =>
          quotedFilter(result as unknown as CalendarEvent, quoted),
      });
      matchedIds = new Set(results.map((r) => r.id));
    }
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

    effect(() => {
      const calendarId = this.calendarId();
      if (calendarId && calendarId !== this.usedCalendarId()) {
        this.usedCalendarId.set(calendarId);
        this.inputCalendarId.set(calendarId);
        const serverQuery = this.serverSideSearchQuery() ?? '';
        this.serverSideSearch.set(serverQuery);
        this.fetchEvents(calendarId, serverQuery);
      } else if (!calendarId) {
        this.allEvents.set([]); // Clear events if no ID
        this.miniSearch.removeAll();
        this.needCalendarId.set(true);
        this.errorMessage.set('Please provide a Calendar ID to fetch events.');
      }

      const clientQuery = this.clientSideSearchQuery() ?? '';
      this.clientSideSearch.set(clientQuery);
      this.searchInput.set(clientQuery);
    });

    effect(() => {
      const calId = this.usedCalendarId();
      this.calendarIdChange.emit(calId);
    });
  }

  /**
   * Parses a search term into quoted and non-quoted parts.
   *
   * This method splits a search string by quotes to separate exact-match phrases
   * (quoted) from general search terms (non-quoted). This allows for more
   * precise filtering of events.
   *
   * @param term The raw search string from the user input.
   * @returns An object containing two properties:
   * - `quoted`: An array of lowercased strings that were enclosed in double quotes.
   * - `nonQuoted`: A single lowercased string comprising all parts of the
   *   search term that were not inside quotes, joined together.
   *
   * @example
   * // Returns { quoted: ['exact phrase'], nonQuoted: 'regular search' }
   * parseSearchTerm('regular "exact phrase" search')
   *
   * @remarks
   * This implementation handles unterminated quotes by treating the content
   * after the last quote as part of the non-quoted search term. For example,
   * `'word "another'` would be parsed as `{ quoted: [], nonQuoted: 'word another' }`.
   */
  private parseSearchTerm(term: string): {
    quoted: string[];
    nonQuoted: string;
  } {
    const parts = term.split('"');
    const quoted: string[] = [];
    const nonQuotedParts: string[] = [];

    // If `parts.length` is even, it indicates an unterminated quote in the term.
    const hasUnterminatedQuote = parts.length % 2 === 0;

    for (let i = 0; i < parts.length; i++) {
      const part = parts[i];
      if (!part) continue;

      // An odd index corresponds to a part within quotes, unless it's the
      // last part of a term with an unterminated quote.
      if (i % 2 === 1 && !(hasUnterminatedQuote && i === parts.length - 1)) {
        quoted.push(part.toLowerCase());
      } else {
        nonQuotedParts.push(part);
      }
    }

    const nonQuoted = nonQuotedParts.join(' ').trim().toLowerCase();
    return { quoted, nonQuoted };
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
    this.clientSideSearchChange.emit(value);
  }

  submitParameters(): void {
    const calendarId = this.inputCalendarId();
    if (calendarId) {
      this.usedCalendarId.set(calendarId);
      this.calendarIdChange.emit(calendarId);
      this.serverSideSearchChange.emit(this.serverSideSearch());
      this.fetchEvents(calendarId, this.serverSideSearch());
    } else {
      this.errorMessage.set('Calendar ID is required.');
    }
  }
}
