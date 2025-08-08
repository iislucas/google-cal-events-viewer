import {
  ChangeDetectionStrategy,
  Component,
  input,
  signal,
} from '@angular/core';
import { CalendarEvent } from '../event.model';
import { DatePipe } from '@angular/common';
import { IconComponent } from '../icons/icon.component';

@Component({
  selector: 'app-event-item',
  standalone: true,
  imports: [DatePipe, IconComponent],
  templateUrl: './event-item.component.html',
  styleUrl: './event-item.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class EventItemComponent {
  event = input.required<CalendarEvent>();
  readonly expandMoreName = 'expand_more';
  readonly expandLessName = 'expand_less';
  expandIconName = signal(this.expandMoreName);

  toggleExpansion(): void {
    if (this.expandIconName() === this.expandLessName) {
      this.expandIconName.set(this.expandMoreName);
    } else {
      this.expandIconName.set(this.expandLessName);
    }
  }
}
