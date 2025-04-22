import {
  Component,
  inject,
  DestroyRef,
  SimpleChanges,
  OnChanges,
  OnInit,
  AfterViewInit,
} from '@angular/core';
import { CalendarListStateService } from '../service/calendar-list-state.service';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { events, CalendarEvent } from '../utils/utils';
import { DatePipe } from '@angular/common';
import { EventGroupingService } from '../service/event-grouping.service';
import { DatePickerService } from '../service/date-picker.service';
import { ConfigService } from '../service/config.service';

@Component({
  selector: 'app-calendar',
  templateUrl: './calendar.component.html',
  styleUrls: ['./calendar.component.scss'],
})
export class CalendarComponent implements OnChanges, OnInit, AfterViewInit {
  /**
   * The current view date that is visible at the top of the list view and is also represented by a circle in the day picker
   * The view date is changed when the user scrolls in the list view or when the user selects a date in the day picker
   */
  viewDate: Date = new Date();

  /**
   * Updated when the user swipes (steps) in the day picker.
   */
  datePickerReferenceDate = new Date();

  /**
   * The raw array of calendar events provided to this component.
   * Developers should pass their events data using this format.
   * Schema reference: https://github.com/mattlewis92/calendar-utils/blob/c51689985f59a271940e30bc4e2c4e1fee3fcb5c/src/calendarUtils.ts#L49-L63
   */
  events: CalendarEvent[] = events;

  /**
   * The list of events grouped by date for display in the calendar list view.
   * This is derived from the raw `events` array and formatted internally by the component.
   */
  groupedEventsByDate: { dateLabel: Date; events: CalendarEvent[] }[] = [];

  /*
   * The day of week abbreviations displayed in the day picker header
   */
  dayOfWeekAbbreviations: string[] = [];

  /**
   * The current week days displayed in the day picker when in week view (not expanded).
   */
  currentWeekDays: Array<{ date: Date; dayNumber: number }> = [];

  /**
   * The current month days displayed in the day picker when in month view (expanded).
   * The month view is structured as an array of weeks, where each week is an array of days.
   */
  currentMonthDays: Array<Array<{ date: Date; dayNumber: number }>> = [];

  /*
   * The current view mode of the day picker
   */
  dayPickerViewMode: 'week' | 'month' = 'week';

  private destroyRef = inject(DestroyRef);

  constructor(
    private calendarListStateService: CalendarListStateService,
    private datePipe: DatePipe,
    private eventGroupingService: EventGroupingService,
    private datePickerService: DatePickerService,
    private configService: ConfigService
  ) {}

  ngOnInit() {
    this.initializeSubscriptions();

    this.groupedEventsByDate = this.eventGroupingService.groupEventsByDate(
      this.events,
      this.viewDate
    );

    // Initialize the current week, month days, and day abbreviations to be displayed in the day picker
    this.currentWeekDays = this.datePickerService.getWeekDays(this.viewDate);
    this.currentMonthDays = this.datePickerService.generateMonth(this.viewDate);
    this.dayOfWeekAbbreviations =
      this.datePickerService.generateDayOfWeekAbbreviations(this.viewDate);
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['events']) {
      // recalculate the grouped events when event changes
      this.groupedEventsByDate = this.eventGroupingService.groupEventsByDate(
        this.events,
        this.viewDate
      );
    }
  }

  ngAfterViewInit(): void {
    this.scrollToSelectedDate();
  }

  initializeSubscriptions(): void {
    // Listen to when users select a date in the day picker
    this.calendarListStateService.dayPickerSelectedDate$
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (date: Date) => {
          this.datePickerReferenceDate = this.viewDate = date;
          // Need to recalculate the grouped events when the user selects a date outside the current list in the day picker
          // TODO: Make sure it's not recalculated unnecessarily
          this.groupedEventsByDate =
            this.eventGroupingService.groupEventsByDate(
              this.events,
              this.viewDate
            );
          this.scrollToSelectedDate();
        },
        error: (err) => {
          console.error('Error in dayPickerSelectedDate$:', err);
        },
      });

    // Listen for the date currently visible at the top of the list view
    this.calendarListStateService.listViewTopDate$
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (date: Date) => {
          this.viewDate = date;
          this.updateDatePickerOnScrollOutOfRange();
        },
        error: (err) => {
          console.error('Error in listViewTopDate$:', err);
        },
      });
  }

  /**
   * Checks if scroll is outside the date picker view
   * and updates the datepicker if needed.
   */
  private updateDatePickerOnScrollOutOfRange(): void {
    const selectedDate = new Date(this.viewDate);

    if (this.dayPickerViewMode === 'month' && this.currentMonthDays?.length) {
      const [firstDay, lastDay] = this.getMonthBoundaries();
      if (selectedDate < firstDay || selectedDate > lastDay) {
        this.currentMonthDays = this.datePickerService.generateMonth(
          this.viewDate
        );
      }
    } else if (
      this.dayPickerViewMode === 'week' &&
      this.currentWeekDays?.length
    ) {
      const [firstDay, lastDay] = this.getWeekBoundaries();
      if (selectedDate < firstDay || selectedDate > lastDay) {
        this.currentWeekDays = this.datePickerService.getWeekDays(
          this.viewDate
        );
      }
    }
  }

  /*
   * This method is called when the user scrolls in the list view.
   * Updates the viewDate in the list view based on the scroll position.
   */
  onScroll(): void {
    const scrollableContainer = document.querySelector('.scroll-container');
    if (!scrollableContainer) return;

    const containerTop = scrollableContainer.getBoundingClientRect().top;
    const headers = Array.from(
      scrollableContainer.querySelectorAll('.date-header-container')
    );

    headers.some((header) => {
      const headerEl = header as HTMLElement;
      if (headerEl.getBoundingClientRect().bottom >= containerTop) {
        const eventGroup = headerEl.closest('.event-group-container');
        if (eventGroup?.id) {
          this.calendarListStateService.setListViewTopDate(
            new Date(eventGroup.id + 'T00:00:00')
          );
        }
        return true; // stops iteration
      }
      return false;
    });
  }

  /**
   * Scrolls to the selected date in the calendar list view when a date is clicked in the day picker.
   * Finds the element with ID matching the formatted date (yyyy-MM-dd) and scrolls it to the top
   *
   */
  private scrollToSelectedDate(): void {
    const formattedSelectedDateLabel = this.datePipe.transform(
      this.viewDate,
      'yyyy-MM-dd'
    );
    if (!formattedSelectedDateLabel) return;

    const listViewContainer = document.querySelector('.scroll-container');
    const dateElement = document.getElementById(formattedSelectedDateLabel);

    if (dateElement && listViewContainer) {
      dateElement.scrollIntoView({
        behavior: 'instant',
        block: 'start',
      });
    }
  }

  /**
   * Handles navigation (swipe/step) actions in the date picker to move between weeks or months.
   * Updates the reference date and regenerates the appropriate view (week/month) based on the navigation direction.
   */
  onChangeStep(event: {
    step: 'next' | 'previous';
    dayPickerViewMode: 'week' | 'month';
  }): void {
    // Update reference date based on navigation direction
    this.datePickerReferenceDate = this.datePickerService.navigateDate(
      this.datePickerReferenceDate,
      event.step,
      event.dayPickerViewMode
    );

    // Regenerate the appropriate view
    if (event.dayPickerViewMode === 'month') {
      this.currentMonthDays = this.datePickerService.generateMonth(
        this.datePickerReferenceDate
      );
    } else {
      this.currentWeekDays = this.datePickerService.getWeekDays(
        this.datePickerReferenceDate
      );
    }
  }

  /**
   * Event emitted from the date picker component to notify when the view mode changes
   */
  onViewModeChange(viewMode: 'week' | 'month') {
    this.dayPickerViewMode = viewMode;
  }

  /*
   * Helper method that returns the first and last dates of the currently displayed month in the datepicker
   */
  private getMonthBoundaries(): [Date, Date] {
    const month = this.currentMonthDays!;
    const firstDay = new Date(month[0][0].date);
    const lastRow = month[month.length - 1];
    const lastDay = new Date(lastRow[lastRow.length - 1].date);
    return [firstDay, lastDay];
  }

  /*
   * Helper method that returns the first and last dates of the currently displayed week in the datepicker
   */
  private getWeekBoundaries(): [Date, Date] {
    const week = this.currentWeekDays!;
    const firstDay = new Date(week[0].date);
    const lastDay = new Date(week[week.length - 1].date);
    return [firstDay, lastDay];
  }

  /* Open the add event dialog */
  openAddEventDialog() {
    console.log('Open Add Event Dialog');
  }

  /* Open the edit event dialog */
  onEventClick(event: any) {
    console.log(event);
  }

  /* Open the add event dialog */
  onNoEventClick(event: any) {
    console.log(event);
  }
}
