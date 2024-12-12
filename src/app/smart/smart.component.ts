import {
  Component,
  inject,
  DestroyRef,
  SimpleChanges,
  ChangeDetectorRef,
} from '@angular/core';
import { StateService } from '../service/state.service';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { events, ListView, CalendarEvent } from '../utils/utils';
import {
  getISOWeek,
  startOfWeek,
  addDays,
  Day,
  subMonths,
  addMonths,
  subWeeks,
  addWeeks,
  startOfMonth,
  endOfMonth,
  endOfWeek,
  subDays,
} from 'date-fns';
import { DatePipe } from '@angular/common';
import { EventGroupingService } from '../service/event-grouping.service';

@Component({
  selector: 'app-smart',
  templateUrl: './smart.component.html',
  styleUrls: ['./smart.component.scss'],
})
export class SmartComponent {
  viewDate: Date = new Date();
  listView = ListView.Day;

  /**
   * The selected date in the day picker
   */
  dayPickerSelectedDate!: Date;

  private destroyRef = inject(DestroyRef);

  events = events;

  /**
   * The list of events grouped by date
   * grouped according to the listView
   */
  groupedEventsByDate: { dateLabel: string; events: CalendarEvent[] }[] = [];

  weekStartsOn: Day | undefined;

  currentWeek: Array<{ date: Date; dayNumber: number }> = [];

  monthDays: Array<Array<{ date: Date; dayNumber: number }>> = [];

  dayAbbreviations: string[] = [];

  constructor(
    private calendarListStateService: StateService,
    private datePipe: DatePipe,
    private cdRef: ChangeDetectorRef,
    private eventGroupingService: EventGroupingService
  ) {
    // listens to when the user scrolls in the list
    this.calendarListStateService.listViewScrolledDate$
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((date: Date) => {
        this.dayPickerSelectedDate = date;
      });

    // listens to when the user select a day in the day picker
    this.calendarListStateService.dayPickerSelectedDate$
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((date: Date) => {
        this.dayPickerSelectedDate = date;
        this.groupedEventsByDate = this.eventGroupingService.groupEventsByDate(
          this.events,
          this.listView,
          this.viewDate
        );
        this.scrollToSelectedDate();
      });
  }

  /**
   * This method is called when the user scrolls in the list view.
   * Updates the dayPickerSelectedDate in the list view based on the scroll position
   */
  onScroll(): void {
    const scrollableContainer = document.querySelector('.scroll-container');
    // Get the position the the scrollable container element relative to the viewport
    const containerPosition = scrollableContainer?.getBoundingClientRect();

    if (!scrollableContainer) return;

    const dateHeaderElements =
      scrollableContainer.querySelectorAll('.date-header');

    for (let i = 0; i < dateHeaderElements.length; i++) {
      const dateHeader = dateHeaderElements[i] as HTMLElement;

      // Get the position the current date header element relative to the viewport
      const headerPosition = dateHeader.getBoundingClientRect();

      // Check if the bottom of the current header is greater than or equal to the top of the scrollable container
      // This means the header is still within view and hasn't been scrolled past the top of the container
      if (
        containerPosition &&
        dateHeader.textContent &&
        headerPosition.bottom >= containerPosition.top
      ) {
        const dateLabel = dateHeader.textContent.trim();

        const parsedDate = this.parseDateFromLabel(dateLabel);

        // Updates the dayPickerSelectedDate in the list view based on the scroll position
        if (parsedDate) {
          this.calendarListStateService.setListViewScrolledDate(parsedDate);
        }

        break;
      }
    }
  }

  /**
   * Loads more dates at the top or bottom of the list
   */
  // Function to handle appending/prepending data
  loadMoreEvents(append: 'previous' | 'next'): void {
    // Get the grouped events based on the current view and date
    const newGroupedEvents = this.eventGroupingService.groupEventsByDate(
      this.events,
      this.listView,
      this.viewDate,
      append
    );

    if (append === 'previous') {
      // Prepend the new data to the beginning of the existing events
      this.groupedEventsByDate = [
        ...newGroupedEvents,
        ...this.groupedEventsByDate,
      ];
    } else if (append === 'next') {
      // Append the new data to the end of the existing events
      this.groupedEventsByDate = [
        ...this.groupedEventsByDate,
        ...newGroupedEvents,
      ];
    }
  }

  private parseDateFromLabel(dateLabel: string): Date | null {
    // Extract day and month from dateLabel
    const parsedDate = new Date(
      `${dateLabel} ${this.dayPickerSelectedDate.getFullYear()}`
    );

    // Check if the parsed date is valid
    if (!isNaN(parsedDate.getTime())) {
      return parsedDate;
    }
    return null;
  }

  openAddEventDialog() {
    // Implement logic to open your event creation dialog or form
    console.log('Open Add Event Dialog');
  }

  ngOnInit() {
    this.currentWeek = this.getCurrentWeek();
    this.generateMonthDays();
    this.generateDayInitials();

    this.loadMoreEvents('previous');
    this.loadMoreEvents('next');
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (
      changes['events'] ||
      changes['viewDate'] ||
      changes['timeRange'] ||
      changes['listView']
    ) {
      this.groupedEventsByDate = this.eventGroupingService.groupEventsByDate(
        this.events,
        this.listView,
        this.viewDate
      );
    }
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

  /*
   *  generates an array representing the days of the current week based on the viewDate *
   */
  getCurrentWeek(): Array<{ date: Date; dayNumber: number }> {
    const currentWeekStart = startOfWeek(this.viewDate, {
      weekStartsOn: this.weekStartsOn || 0,
    });

    return Array.from({ length: 7 }, (_, dayIndex) => {
      const date = addDays(currentWeekStart, dayIndex);
      return {
        date,
        dayNumber: date.getDate(),
      };
    });
  }

  onChangeStep(event: {
    step: 'next' | 'previous';
    isExpanded: boolean;
  }): void {
    if (event.step === 'next') {
      if (event.isExpanded) {
        this.viewDate = subMonths(this.viewDate, 1);
        this.updateCurrentMonth();
      } else {
        this.viewDate = subWeeks(this.viewDate, 1);
        this.currentWeek = this.getCurrentWeek();
      }
    } else {
      if (event.isExpanded) {
        this.viewDate = addMonths(this.viewDate, 1);
        this.updateCurrentMonth();
      } else {
        this.viewDate = addWeeks(this.viewDate, 1);
        this.currentWeek = this.getCurrentWeek();
      }
    }
  }

  updateCurrentMonth() {
    const start = startOfMonth(this.viewDate);
    const end = endOfMonth(this.viewDate);
    const startDate = startOfWeek(start, {
      weekStartsOn: this.weekStartsOn || 0,
    });
    const endDate = endOfWeek(end, { weekStartsOn: this.weekStartsOn || 0 });

    let date = startDate;
    const weeks: Array<Array<{ date: Date; dayNumber: number }>> = [];
    let week: Array<{ date: Date; dayNumber: number }> = [];

    while (date <= endDate) {
      week.push({
        date: new Date(date),
        dayNumber: date.getDate(),
      });

      if (week.length === 7) {
        weeks.push(week);
        week = [];
      }

      date = addDays(date, 1);
    }

    this.monthDays = weeks;
  }

  private generateMonthDays(): void {
    const start = startOfMonth(this.viewDate);
    const end = endOfMonth(this.viewDate);
    const startDate = startOfWeek(start, {
      weekStartsOn: this.weekStartsOn || 0,
    });
    const endDate = endOfWeek(end, {
      weekStartsOn: this.weekStartsOn || 0,
    });

    let date = startDate;
    const weeks: Array<Array<{ date: Date; dayNumber: number }>> = [];
    let week: Array<{ date: Date; dayNumber: number }> = [];

    while (date <= endDate) {
      week.push({
        date: new Date(date),
        dayNumber: date.getDate(),
      });

      if (week.length === 7) {
        weeks.push(week);
        week = [];
      }

      date = addDays(date, 1);
    }

    this.monthDays = weeks;
  }

  private generateDayInitials(): void {
    const weekStart = startOfWeek(this.viewDate, {
      weekStartsOn: this.weekStartsOn,
    });
    this.dayAbbreviations = Array.from({ length: 7 }, (_, i) => {
      const day = addDays(weekStart, i);
      return this.datePipe.transform(day, 'EEE') || '';
    });
  }

  ngOnDestroy() {
    // Restore parent scrollbar
  }
}
