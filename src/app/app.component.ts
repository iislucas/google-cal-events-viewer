import { Component, computed, inject } from '@angular/core';
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

  readonly calendarId = computed(() => this.queryParams()?.['calendarId']);
  readonly clientQuery = computed(() => this.queryParams()?.['q']);
  readonly serverQuery = computed(() => this.queryParams()?.['qServer']);

  onCalendarIdChange(id: string): void {
    this.router.navigate([], {
      queryParams: { calendarId: id },
      queryParamsHandling: 'merge',
    });
  }

  onClientSideSearchChange(query: string): void {
    this.router.navigate([], {
      queryParams: { q: query || null },
      queryParamsHandling: 'merge',
    });
  }

  onServerSideSearchChange(query: string): void {
    this.router.navigate([], {
      queryParams: { qServer: query || null },
      queryParamsHandling: 'merge',
    });
  }
}
