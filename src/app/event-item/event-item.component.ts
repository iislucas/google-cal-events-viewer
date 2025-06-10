import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { CalendarEvent } from '../event.model';
import { DatePipe } from '@angular/common';

@Component({
  selector: 'app-event-item',
  standalone: true,
  imports: [DatePipe],
  templateUrl: './event-item.component.html',
  styleUrl: './event-item.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class EventItemComponent {
  event = input.required<CalendarEvent>();
}
