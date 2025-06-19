import { Component, computed, effect, inject, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { EventListComponent } from './event-list/event-list.component';
import { toSignal } from '@angular/core/rxjs-interop';

@Component({
  selector: 'app-root',
  imports: [EventListComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
})
export class AppComponent {
  title = 'google-cal-events-viewer';

  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private queryParams = toSignal(this.route.queryParams);
  readonly calendarId = signal('');
  readonly clientQuery = signal('');
  readonly serverQuery = signal('');

  constructor() {
    effect(() => {
      const params = this.queryParams();
      if (!params) {
        return;
      } else {
        console.log('params', params);
        this.calendarId.set(params['calendarId'] || '');
        this.clientQuery.set(params['q'] || '');
        this.serverQuery.set(params['qServer'] || '');
      }
    });
  }

  onCalendarIdChange(id: string): void {
    if (this.calendarId() !== id) {
      this.router.navigate([], {
        queryParams: { calendarId: id },
        queryParamsHandling: 'merge',
      });
    }
  }

  onClientSideSearchChange(query: string): void {
    if (this.clientQuery() !== query) {
      this.router.navigate([], {
        queryParams: { q: query || null },
        queryParamsHandling: 'merge',
      });
    }
  }

  onServerSideSearchChange(query: string): void {
    if (this.serverQuery() !== query) {
      this.router.navigate([], {
        queryParams: { qServer: query || null },
        queryParamsHandling: 'merge',
      });
    }
  }
}
