import {
  Component,
  inject,
  DestroyRef,
  SimpleChanges,
  ChangeDetectorRef,
  OnChanges,
  OnInit,
  AfterViewInit,
} from '@angular/core';
import { StateService } from '../service/state.service';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { events, ListView, CalendarEvent } from '../utils/utils';
import { Day, subMonths, addMonths } from 'date-fns';
import { DatePipe } from '@angular/common';
import { EventGroupingService } from '../service/event-grouping.service';
import { DatePickerService } from '../service/date-picker.service';

@Component({
  selector: 'app-smart',
  templateUrl: './smart.component.html',
  styleUrls: ['./smart.component.scss'],
})
export class SmartComponent implements OnChanges, OnInit, AfterViewInit {
  /**
   * The current view date
   */
  viewDate: Date = new Date();

  /**
   * Determines how events are grouped in the list view, either by day, week, or month.
   */
  listView = ListView.Day;

  /**
   * The selected date in the day picker
   */
  dayPickerSelectedDate!: Date;

  /**
   * An array of events to display on view
   * The schema is available here: https://github.com/mattlewis92/calendar-utils/blob/c51689985f59a271940e30bc4e2c4e1fee3fcb5c/src/calendarUtils.ts#L49-L63
   */
  events: CalendarEvent[] = events;

  /**
   * The list of events grouped by date
   * grouped according to the listView
   */
  groupedEventsByDate: { dateLabel: string; events: CalendarEvent[] }[] = [];

  /*
   * The current week days displayed in the day picker when not expanded
   */
  currentWeekDays: Array<{ date: Date; dayNumber: number }> = [];

  /*
   * The current month days displayed in the day picker when expanded
   */
  currentMonthDays: Array<Array<{ date: Date; dayNumber: number }>> = [];

  /*
   * The day of week abbreviations displayed in the day picker header
   */
  dayOfWeekAbbreviations: string[] = [];

  dayPickerViewMode: 'week' | 'month' = 'week';

  weekStartsOn: Day | undefined;

  private destroyRef = inject(DestroyRef);

  constructor(
    private calendarListStateService: StateService,
    private datePipe: DatePipe,
    private cdr: ChangeDetectorRef,
    private eventGroupingService: EventGroupingService,
    private datePickerService: DatePickerService
  ) {}

  ngOnInit() {
    this.initializeSubscriptions();

    // Initialize the current week, month days, and day abbreviations to be displayed in the day picker
    this.currentWeekDays = this.datePickerService.getWeekDays(this.viewDate, 0);
    this.currentMonthDays = this.datePickerService.generateMonth(
      this.viewDate,
      0
    );
    this.dayOfWeekAbbreviations =
      this.datePickerService.generateDayOfWeekAbbreviations(this.viewDate, 0);
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['events'] || changes['listView']) {
      // recalculate the grouped events when the events or listView changes
      this.groupedEventsByDate = this.eventGroupingService.groupEventsByDate(
        this.events,
        this.listView,
        this.viewDate
      );
    }
  }

  ngAfterViewInit(): void {
    // Leave a small gap at the top of the list view to allow for scrolling and trigger new events on scroll
    const scrollableContainer = document.querySelector('.scroll-container');

    if (scrollableContainer) {
      scrollableContainer.scrollTop = 5;
    }
  }

  private initializeSubscriptions(): void {
    // listens to when the user scrolls in the list
    this.calendarListStateService.listViewScrolledDate$
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((date: Date) => {
        this.dayPickerSelectedDate = date;
        this.updateDatePickerOnScrollOutOfRange();
      });

    // listens to when the user selects a day in the day picker
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
   * Checks if scroll is outside the date picker view
   * and updates the view if needed.
   */
  private updateDatePickerOnScrollOutOfRange(): void {
    if (
      this.dayPickerViewMode === 'month' &&
      this.currentMonthDays?.length > 0
    ) {
      const firstDay = new Date(this.currentMonthDays[0][0].date);
      const lastDay = new Date(
        this.currentMonthDays[this.currentMonthDays.length - 1][
          this.currentMonthDays[this.currentMonthDays.length - 1].length - 1
        ].date
      );

      const selectedDate = new Date(this.dayPickerSelectedDate);

      if (selectedDate < firstDay || selectedDate > lastDay) {
        this.viewDate = this.dayPickerSelectedDate;
        this.currentMonthDays = this.datePickerService.generateMonth(
          this.dayPickerSelectedDate,
          0
        );
      }
    } else if (
      this.dayPickerViewMode === 'week' &&
      this.currentWeekDays?.length > 0
    ) {
      const firstDay = new Date(this.currentWeekDays[0].date);
      const lastDay = new Date(
        this.currentWeekDays[this.currentWeekDays.length - 1].date
      );
      const selectedDate = new Date(this.dayPickerSelectedDate);

      if (selectedDate < firstDay || selectedDate > lastDay) {
        this.viewDate = this.dayPickerSelectedDate;
        this.currentWeekDays = this.datePickerService.getWeekDays(
          this.dayPickerSelectedDate,
          0
        );
      }
    }
  }

  /*
   * This method is called when the user scrolls in the list view.
   * Updates the dayPickerSelectedDate in the list view based on the scroll position.
   * Loads more events when the user scrolls to the top or bottom of the list view.
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

        const parsedDate = new Date(
          `${dateLabel} ${this.dayPickerSelectedDate.getFullYear()}`
        );

        // Updates the dayPickerSelectedDate in the list view based on the scroll position
        if (parsedDate) {
          this.calendarListStateService.setListViewScrolledDate(parsedDate);
        }

        break;
      }
    }

    // Load more events when the user scrolls to the top or bottom of the list view
    if (scrollableContainer.scrollTop === 0) {
      // This is needed to maintain the scroll position when adding events to the top
      const currentOffset =
        scrollableContainer.scrollHeight - scrollableContainer.scrollTop;

      // Call the loadMoreEvents function
      this.loadMoreEvents('previous');

      this.cdr.detectChanges();

      scrollableContainer.scrollTop =
        scrollableContainer.scrollHeight - currentOffset;
    } else if (
      scrollableContainer.scrollHeight - scrollableContainer.scrollTop ===
      scrollableContainer.clientHeight
    ) {
      // Scrolled to the bottom - Load next events
      this.loadMoreEvents('next');
    }
  }

  /*
   * Scrolls to the selected date in the calendar list view when a date is clicked in the day picker.
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
   * Load more events when the user scrolls to the top or bottom of the list view
   * @param append - Determines whether to load more events to the previous or next period
   *
   */
  loadMoreEvents(append: 'previous' | 'next'): void {
    // Limit the number of items in the list view
    const maxItems = 150;

    const newGroupedEvents = this.eventGroupingService.groupEventsByDate(
      this.events,
      this.listView,
      this.viewDate,
      append
    );

    if (append === 'previous') {
      this.viewDate = subMonths(this.viewDate, 1);
      this.groupedEventsByDate = [
        ...newGroupedEvents,
        ...this.groupedEventsByDate,
      ];

      if (this.groupedEventsByDate.length > maxItems) {
        this.groupedEventsByDate = this.groupedEventsByDate.slice(0, maxItems);
      }
    } else if (append === 'next') {
      this.viewDate = addMonths(this.viewDate, 1);
      this.groupedEventsByDate = [
        ...this.groupedEventsByDate,
        ...newGroupedEvents,
      ];

      if (this.groupedEventsByDate.length > maxItems) {
        this.groupedEventsByDate = this.groupedEventsByDate.slice(-maxItems);
      }
    }
  }

  /*
   * Step back or forward in the stepper in the the day picker
   */
  onChangeStep(event: {
    step: 'next' | 'previous';
    dayPickerViewMode: 'week' | 'month';
  }): void {
    const direction = event.step === 'next' ? 'next' : 'previous';

    // Navigate the date based on direction and expansion status
    this.viewDate = this.datePickerService.navigateDate(
      this.viewDate,
      direction,
      event.dayPickerViewMode
    );

    if (event.dayPickerViewMode) {
      // Generate month if expanded
      this.currentMonthDays = this.datePickerService.generateMonth(
        this.viewDate,
        0
      );
    } else {
      // Generate week if not expanded
      this.currentWeekDays = this.datePickerService.getWeekDays(
        this.viewDate,
        0
      );
    }
  }

  onViewModeChange(viewMode: 'week' | 'month') {
    this.dayPickerViewMode = viewMode;
  }

  openAddEventDialog() {
    // Implement logic to open your event creation dialog or form
    console.log('Open Add Event Dialog');
  }
}
