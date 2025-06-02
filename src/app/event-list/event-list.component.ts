import { Component, OnInit } from '@angular/core';
import { CommonModule, NgFor } from '@angular/common';
import { FormsModule } from '@angular/forms'; // Import FormsModule
import { ActivatedRoute, Router } from '@angular/router'; // Import ActivatedRoute and Router
import { GoogleCalendarService } from '../google-calendar.service';
import { CalendarEvent } from '../event.model'; // Import the interface

@Component({
  selector: 'app-event-list',
  standalone: true, // Ensure this is a standalone component
  imports: [CommonModule, NgFor, FormsModule], // Add FormsModule here
  templateUrl: './event-list.component.html',
  styleUrl: './event-list.component.scss',
})
export class EventListComponent implements OnInit {
  events: CalendarEvent[] = [];
  errorMessage: string | null = null; // To display error messages
  inputCalendarId: string = '';
  inputApiKey: string = '';
  showInputFields: boolean = false;

  constructor(
    private googleCalendarService: GoogleCalendarService,
    private route: ActivatedRoute, // Inject ActivatedRoute
    private router: Router // Inject Router
  ) {}

  ngOnInit(): void {
    this.route.queryParamMap.subscribe((params) => {
      const calendarId = params.get('calendarId');
      const apiKey = params.get('apiKey');

      if (calendarId && apiKey) {
        this.fetchEvents(calendarId, apiKey);
        this.showInputFields = false;
      } else {
        this.showInputFields = true;
        this.errorMessage =
          'Please provide Calendar ID and API Key to fetch events.';
      }
    });
  }

  fetchEvents(calendarId: string, apiKey: string): void {
    this.errorMessage = null; // Clear any previous error messages
    this.googleCalendarService
      .getPublicCalendarEvents(calendarId, apiKey)
      .subscribe({
        next: (data) => {
          this.events = data;
          console.log('Fetched events:', this.events);
        },
        error: (err) => {
          console.error('Error fetching calendar events:', err);
          this.errorMessage =
            'Error fetching calendar events. Please check the console for more details or verify your Calendar ID and API Key.';
        },
      });
  }

  submitParameters(): void {
    if (this.inputCalendarId && this.inputApiKey) {
      this.router.navigate([], {
        relativeTo: this.route,
        queryParams: {
          calendarId: this.inputCalendarId,
          apiKey: this.inputApiKey,
        },
        queryParamsHandling: 'merge', // Merge with existing query params
      });
      // The subscription in ngOnInit will handle fetching events after navigation
      this.showInputFields = false;
    } else {
      this.errorMessage = 'Both Calendar ID and API Key are required.';
    }
  }
}
