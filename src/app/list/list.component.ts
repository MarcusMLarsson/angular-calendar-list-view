import {
  Component,
  Input,
  OnChanges,
  SimpleChanges,
  Output,
  EventEmitter,
  OnInit,
  inject,
  DestroyRef,
} from '@angular/core';
import { DatePipe } from '@angular/common';
import { StateService } from '../service/state.service';
import { ListView, CalendarEvent } from '../utils/utils';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { getISOWeek } from 'date-fns';

@Component({
  selector: 'app-list',
  templateUrl: './list.component.html',
  styleUrls: ['./list.component.scss'],
})
export class ListComponent implements OnChanges, OnInit {
  /**
   * The current view date
   */
  @Input() viewDate!: Date;

  /**
   * An array of events to display on view
   * The schema is available here: https://github.com/mattlewis92/calendar-utils/blob/c51689985f59a271940e30bc4e2c4e1fee3fcb5c/src/calendarUtils.ts#L49-L63
   */
  @Input() events: CalendarEvent[] = [];

  /**
   * Determines how events are grouped in the list view, either by day, week, or month.
   */
  @Input() listView: ListView = ListView.Day;

  /**
   *  Emits the event when clicking on an event in the list view
   *  For example, you can use this event to open a dialog with event details.
   */
  @Output() eventClicked = new EventEmitter<{
    event: CalendarEvent;
    sourceEvent: MouseEvent | KeyboardEvent;
  }>();

  /**
   * The list of events grouped by date
   * grouped according to the listView
   */
  groupedEventsByDate: { dateLabel: string; events: CalendarEvent[] }[] = [];

  /**
   * The selected date in the day picker
   */
  dayPickerSelectedDate!: Date;

  private destroyRef = inject(DestroyRef);

  constructor(
    private datePipe: DatePipe,
    private calendarListStateService: StateService
  ) {}

  ngOnInit() {
    // listens to when the user select a day in the day picker
    this.calendarListStateService.dayPickerSelectedDate$
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((date) => {
        this.dayPickerSelectedDate = date;
        this.groupEventsByDate();
        this.scrollToSelectedDate();
      });
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (
      changes['events'] ||
      changes['viewDate'] ||
      changes['timeRange'] ||
      changes['listView']
    ) {
      this.groupEventsByDate();
    }
  }

  /**
   * Groups events by date based on the current list view.
   * Ensures labels are shown even when there are no events.
   */
  private groupEventsByDate(): void {
    // the property of the object is the date label and the value is the list of events for that date
    const groupedEvents: Record<string, CalendarEvent[]> = {};

    // Generates labels based on the current view and initializes the grouped object.
    switch (this.listView) {
      case ListView.Day:
        this.generateDailyLabels(groupedEvents);
        break;
      case ListView.Week:
        this.generateWeekLabels(groupedEvents);
        break;
      case ListView.Month:
        this.generateMonthLabels(groupedEvents);
        break;
    }

    // Adds events to their respective groups based on the date labels.
    for (const event of this.events) {
      const dateLabel = this.getDateLabel(event.start);

      // Match the label from the event to the key in the grouped object
      if (groupedEvents[dateLabel]) {
        // Adds the value to the existing key
        groupedEvents[dateLabel].push(event);
      }
    }

    // Format the grouped data for display
    // Ensures labels are shown even when there are no events.
    this.groupedEventsByDate = Object.entries(groupedEvents).map(
      ([dateLabel, events]) => ({
        dateLabel,
        events,
      })
    );
  }

  /**
   * Generates daily labels for the current view month.
   */
  private generateDailyLabels(grouped: Record<string, CalendarEvent[]>): void {
    const firstDayOfCurrentMonth = new Date(
      this.viewDate.getFullYear(),
      this.viewDate.getMonth(),
      1
    );

    const lastDayOfCurrentMonth = new Date(
      this.viewDate.getFullYear(),
      this.viewDate.getMonth() + 1,
      // 0 interpreted as last day of previous month
      0
    );

    while (firstDayOfCurrentMonth <= lastDayOfCurrentMonth) {
      const dateLabel = this.datePipe.transform(
        firstDayOfCurrentMonth,
        'EEEE, MMMM d'
      );

      // Sets the date label as the key and initializes an empty array for the value
      if (dateLabel) {
        grouped[dateLabel] = [];
      }
      firstDayOfCurrentMonth.setDate(firstDayOfCurrentMonth.getDate() + 1);
    }
  }

  /**
   * Generates weekly labels for the current year.
   */
  private generateWeekLabels(grouped: Record<string, CalendarEvent[]>): void {
    let firstDayOfCurrentYear = new Date(this.viewDate.getFullYear(), 0, 1);
    const lastDayOfCurrentYear = new Date(this.viewDate.getFullYear(), 11, 31);

    while (firstDayOfCurrentYear <= lastDayOfCurrentYear) {
      const weekNumber = this.getWeekNumber(firstDayOfCurrentYear);
      grouped[weekNumber] = [];
      firstDayOfCurrentYear.setDate(firstDayOfCurrentYear.getDate() + 7);
    }
  }

  /**
   * Generates monthly labels for the current year.
   */
  private generateMonthLabels(grouped: Record<string, CalendarEvent[]>): void {
    for (let month = 0; month < 12; month++) {
      const monthLabel = this.datePipe.transform(
        new Date(this.viewDate.getFullYear(), month, 1),
        'MMMM yyyy'
      );
      if (monthLabel) {
        grouped[monthLabel] = [];
      }
    }
  }

  /**
   * Retrieves a formatted date label based on the current list view.
   */
  private getDateLabel(date: Date): string {
    switch (this.listView) {
      case ListView.Day:
        return this.datePipe.transform(date, 'EEEE, MMMM d') as string;
      case ListView.Week:
        return this.getWeekNumber(date);
      case ListView.Month:
        return this.datePipe.transform(date, 'MMMM yyyy') as string;
      default:
        return '';
    }
  }

  /**
   * Using date-fns to calculate ISO week number
   */
  private getWeekNumber(date: Date): string {
    const weekNumber = getISOWeek(date);
    return `W${weekNumber}`;
  }

  /*
   * Scrolls to the selected date in the calendar list view when a date is clicked in the day picker.
   * TODO: Gets stuck at the bottom / top of the list view when there is no more data
   */
  private scrollToSelectedDate(): void {
    // Format the selected date to match the date label in the list view
    const formattedSelectedDateLabel = this.datePipe.transform(
      this.dayPickerSelectedDate,
      'EEEE, MMMM d'
    );

    // Find the DOM element that matches the selected date label
    const dateElement = document.getElementById(
      'date-' + formattedSelectedDateLabel
    );

    // Get reference to the scroll container
    const listViewContainer = document.querySelector('.scroll-container');

    if (dateElement && listViewContainer) {
      // Scroll the element into view with an offset (for the header)
      // block: 'start' option ensures the element scrolls to the top of the container.
      dateElement.scrollIntoView({
        behavior: 'smooth',
        block: 'start',
        inline: 'nearest',
      });
    }
  }

  // Emits the event when clicking on an event in the list view
  onEventClick(
    event: CalendarEvent,
    sourceEvent: MouseEvent | KeyboardEvent
  ): void {
    // TODO: Implement functionality to open a dialog with event details.
    this.eventClicked.emit({ event, sourceEvent });
  }
}
