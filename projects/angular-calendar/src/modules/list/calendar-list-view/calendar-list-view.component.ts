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
import { DateAdapter, getWeekViewPeriod } from '../../calendar.module';

@Component({
  selector: 'mwl-calendar-list-view',
  template: `
    <div class="calendar-list-view">
      <div *ngIf="groupedEventsByDate.length === 0">
        <p>No events for this period.</p>
      </div>

      <div *ngFor="let eventGroup of groupedEventsByDate">
        <h3>{{ eventGroup.dateLabel }}</h3>
        <ul>
          <li
            *ngFor="let event of eventGroup.events"
            (mwlClick)="
              eventClicked.emit({ sourceEvent: $event, event: event })
            "
          >
            <span
              class="event-color-circle"
              [ngStyle]="{ 'background-color': event.color?.primary }"
            ></span>
            <strong class="event-title">{{ event.title }}</strong> -
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
  @Input() viewDate: Date;
  @Input() events: CalendarEvent[] = [];
  @Input() weekStartsOn: number;
  @Input() excludeDays: number[] = [];

  @Output() eventClicked = new EventEmitter<{
    event: CalendarEvent;
    sourceEvent: MouseEvent | KeyboardEvent;
  }>();

  groupedEventsByDate: { dateLabel: string; events: CalendarEvent[] }[] = [];

  constructor(private datePipe: DatePipe, protected dateAdapter: DateAdapter) {}

  ngOnChanges(changes: SimpleChanges): void {
    if (changes.events || changes.viewDate || changes.timeRange) {
      this.groupEventsByDate();
    }
  }

  /**
   * Groups events by their start date (ignoring time), and provides a formatted
   * date label for each group of events.
   */
  private groupEventsByDate(): void {
    const grouped: { [key: string]: CalendarEvent[] } = {};

    //  [dayStartHour]="dayStartHour"
    //[dayEndHour]="dayEndHour"

    const weekPeriod = getWeekViewPeriod(
      this.dateAdapter,
      this.viewDate,
      this.weekStartsOn || 0,
      this.excludeDays
    );

    const { viewStart, viewEnd } = weekPeriod;

    // Iterate through each event and group by date (without time)
    for (const event of this.events) {
      if (event.start >= viewStart && event.start <= viewEnd) {
        const eventDate = this.datePipe.transform(event.start, 'yyyy-MM-dd');
        if (!grouped[eventDate]) {
          grouped[eventDate] = [];
        }
        grouped[eventDate].push(event);
      }
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
