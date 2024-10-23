import {
  Component,
  Input,
  OnChanges,
  SimpleChanges,
  Output,
  EventEmitter,
} from '@angular/core';
import { CalendarEvent, getMonthView } from 'calendar-utils';
import { DatePipe } from '@angular/common';
import {
  CalendarUtils,
  DateAdapter,
  getWeekViewPeriod,
} from '../../calendar.module';
import { ListView } from '../../common/calendar-view/list-view.enum';

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
  /**
   * The current view date
   */
  @Input() viewDate: Date;

  /**
   * An array of events to display on view.
   * The schema is available here: https://github.com/mattlewis92/calendar-utils/blob/c51689985f59a271940e30bc4e2c4e1fee3fcb5c/src/calendarUtils.ts#L49-L63
   */
  @Input() events: CalendarEvent[] = [];

  /**
   * The start number of the week.
   * If using the moment date adapter this option won't do anything and you'll need to set it globally like so:
   * ```
   * moment.updateLocale('en', {
   *   week: {
   *     dow: 1, // set start of week to monday instead
   *     doy: 0,
   *   },
   * });
   * ```
   */
  @Input() weekStartsOn: number;

  /**
   * An array of day indexes (0 = sunday, 1 = monday etc) that will be hidden on the view
   */
  @Input() excludeDays: number[] = [];

  /**
   * An array of day indexes (0 = sunday, 1 = monday etc) that indicate which days are weekends
   */
  @Input() weekDays: number[] = [];

  @Input() listView: ListView;

  @Output() eventClicked = new EventEmitter<{
    event: CalendarEvent;
    sourceEvent: MouseEvent | KeyboardEvent;
  }>();

  groupedEventsByDate: { dateLabel: string; events: CalendarEvent[] }[] = [];

  constructor(
    private datePipe: DatePipe,
    protected dateAdapter: DateAdapter,
    protected utils: CalendarUtils
  ) {}

  ngOnChanges(changes: SimpleChanges): void {
    if (
      changes.events ||
      changes.viewDate ||
      changes.timeRange ||
      changes.listView
    ) {
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

    let viewStart: Date;
    let viewEnd: Date;

    switch (this.listView) {
      case ListView.Day:
        viewStart = new Date(this.viewDate);
        viewStart.setHours(0, 0, 0, 0);

        viewEnd = new Date(this.viewDate);
        viewEnd.setHours(23, 59, 59, 999);
        break;

      case ListView.Week:
        const weekPeriod = getWeekViewPeriod(
          this.dateAdapter,
          this.viewDate,
          this.weekStartsOn || 0,
          this.excludeDays
        );

        viewStart = weekPeriod.viewStart;
        viewEnd = weekPeriod.viewEnd;

        break;

      case ListView.Month:
        const monthView = this.utils.getMonthView({
          events: this.events,
          viewDate: this.viewDate,
          weekStartsOn: this.weekStartsOn,
          excluded: this.excludeDays,
          weekendDays: this.weekDays,
        });

        viewStart = new Date(monthView.period.start);
        viewEnd = new Date(monthView.period.end);
        break;

      case ListView.All:
        // Start from effectively no lower bound and end at effectively no upper bound
        viewStart = new Date(0);
        viewEnd = new Date(8640000000000000);
        break;

      default:
        return;
    }

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
