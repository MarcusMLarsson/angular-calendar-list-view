import {
  Component,
  Input,
  OnChanges,
  SimpleChanges,
  Output,
  EventEmitter,
} from '@angular/core';
import { CalendarEvent } from 'calendar-utils';
import { DatePipe } from '@angular/common';

@Component({
  selector: 'mwl-calendar-list-view',
  template: `
    <div class="calendar-list-view">
      <div *ngFor="let eventGroup of groupedEventsByDate">
        <h3>{{ eventGroup.dateLabel }}</h3>
        <ul>
          <li
            *ngFor="let event of eventGroup.events"
            (mwlClick)="
              eventClicked.emit({ sourceEvent: $event, event: event })
            "
          >
            <strong>{{ event.title }}</strong> -
            {{ event.start | date : 'shortTime' }} to
            {{ event.end | date : 'shortTime' }}
          </li>
        </ul>
      </div>
    </div>
  `,
  styleUrls: ['./calendar-list-view.scss'],
  providers: [DatePipe],
})
export class CalendarListViewComponent implements OnChanges {
  /**
   * The current view date
   */
  @Input() viewDate: Date;

  /**
   * An array of events to display on view
   */
  @Input() events: CalendarEvent[] = [];

  @Output() eventClicked = new EventEmitter<{
    event: CalendarEvent;
    sourceEvent: MouseEvent | KeyboardEvent;
  }>();

  groupedEventsByDate: { dateLabel: string; events: CalendarEvent[] }[] = [];

  constructor(private datePipe: DatePipe) {}

  ngOnChanges(changes: SimpleChanges): void {
    if (changes.events) {
      this.groupEventsByDate();
    }
  }

  /**
   * Groups events by their start date (ignoring time), and provides a formatted
   * date label for each group of events.
   */
  private groupEventsByDate(): void {
    const grouped: { [key: string]: CalendarEvent[] } = {};

    // Iterate through each event and group by date (without time)
    for (const event of this.events) {
      const eventDate = this.datePipe.transform(event.start, 'yyyy-MM-dd');
      if (!grouped[eventDate]) {
        grouped[eventDate] = [];
      }
      grouped[eventDate].push(event);
    }

    // Convert the grouped object into an array with formatted date labels
    this.groupedEventsByDate = Object.keys(grouped).map((date) => ({
      dateLabel: this.formatDateLabel(new Date(date)),
      events: grouped[date],
    }));
  }

  /**
   * Formats the date into a readable label for the list view. Uses "Today" or "Tomorrow"
   * for events occurring on those days, otherwise provides a formatted date string.
   */
  private formatDateLabel(date: Date): string {
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);

    if (this.isSameDay(date, today)) {
      return 'Today';
    } else if (this.isSameDay(date, tomorrow)) {
      return 'Tomorrow';
    } else {
      // Return formatted date if it's not today or tomorrow
      return this.datePipe.transform(date, 'EEEE, MMMM d');
    }
  }

  /**
   * Utility function to check if two dates are the same day (ignores time).
   */
  private isSameDay(date1: Date, date2: Date): boolean {
    return (
      date1.getFullYear() === date2.getFullYear() &&
      date1.getMonth() === date2.getMonth() &&
      date1.getDate() === date2.getDate()
    );
  }
}
