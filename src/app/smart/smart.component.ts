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
import { Day, subMonths, addMonths, parse } from 'date-fns';
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
   * An array of events to display on view
   * The schema is available here: https://github.com/mattlewis92/calendar-utils/blob/c51689985f59a271940e30bc4e2c4e1fee3fcb5c/src/calendarUtils.ts#L49-L63
   */
  events: CalendarEvent[] = events;

  /**
   * The list of events grouped by date
   * grouped according to the listView
   */
  groupedEventsByDate: { dateLabel: Date; events: CalendarEvent[] }[] = [];

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

  /*
   * Used to prevent that the scrollToSelectedDate method triggers onScroll
   */
  private isProgrammaticScroll = false;

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
    // Create a flag to track recent day picker interaction
    // Needed since both the scroll and the day picker update the selected date, which can cause conflicts
    // If the day picker was recently used, the day picker selected date should take priority
    let dayPickerPriority = false;

    this.calendarListStateService.dayPickerSelectedDate$
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((date: Date) => {
        dayPickerPriority = true;
        this.viewDate = date;
        this.groupedEventsByDate = this.eventGroupingService.groupEventsByDate(
          this.events,
          this.listView,
          this.viewDate
        );
        this.cdr.detectChanges();
        this.scrollToSelectedDate();

        // Reset priority after a short delay
        setTimeout(() => {
          dayPickerPriority = false;
        }, 500);
      });

    // Scroll stream
    this.calendarListStateService.listViewScrolledDate$
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((date: Date) => {
        // Only update if day picker hasn't been recently used
        if (!dayPickerPriority) {
          this.viewDate = date;
          this.updateDatePickerOnScrollOutOfRange();
        }
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

      const selectedDate = new Date(this.viewDate);

      if (selectedDate < firstDay || selectedDate > lastDay) {
        this.currentMonthDays = this.datePickerService.generateMonth(
          this.viewDate,
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
      const selectedDate = new Date(this.viewDate);

      if (selectedDate < firstDay || selectedDate > lastDay) {
        this.viewDate = this.viewDate;
        this.currentWeekDays = this.datePickerService.getWeekDays(
          this.viewDate,
          0
        );
      }
    }
  }

  /*
   * This method is called when the user scrolls in the list view.
   * Updates the viewDate in the list view based on the scroll position.
   * Loads more events when the user scrolls to the top or bottom of the list view.
   */
  onScroll(): void {
    const scrollableContainer = document.querySelector('.scroll-container');
    if (!scrollableContainer) return;

    const containerPosition = scrollableContainer.getBoundingClientRect();

    // Select all date header containers
    const dateHeaderContainers = scrollableContainer.querySelectorAll(
      '.date-header-container'
    );

    for (let i = 0; i < dateHeaderContainers.length; i++) {
      const dateHeaderContainer = dateHeaderContainers[i] as HTMLElement;

      // Get position of the current header container
      const headerPosition = dateHeaderContainer.getBoundingClientRect();

      if (containerPosition && headerPosition.bottom >= containerPosition.top) {
        // Extract weekday and month-year text from the container
        const weekdayHeader = dateHeaderContainer
          .querySelector('.date-header')
          ?.textContent?.trim();
        const monthYearHeader = dateHeaderContainer
          .querySelector('.date-sub-header')
          ?.textContent?.trim();

        if (weekdayHeader && monthYearHeader) {
          // Combine the weekday and month-year parts into a full date string
          const fullDateString = `${weekdayHeader} ${monthYearHeader}`;

          const parsedDate = new Date(fullDateString);

          if (parsedDate) {
            this.calendarListStateService.setListViewScrolledDate(parsedDate);
          }
        }
        break;
      }
    }

    if (this.isProgrammaticScroll) {
      return;
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
    this.isProgrammaticScroll = true;

    // Format the selected date to match the date label in the list view
    // date format needs to match the date label in the list view
    const formattedSelectedDateLabel = this.datePipe.transform(
      this.viewDate,
      'yyyy-MM-dd'
    );

    // Find the DOM element that matches the selected date label
    const dateElement = document.getElementById(
      'date-' + formattedSelectedDateLabel
    );

    const listViewContainer = document.querySelector('.scroll-container');

    // fallback is needed when the dates in the datepicker are outside the current view
    if (!dateElement) {
      console.log('fallback');
      if (this.viewDate.getDate() > 15) {
        this.loadMoreEvents('previous');
        this.cdr.detectChanges();
      } else {
        this.loadMoreEvents('next');
        this.cdr.detectChanges();
      }

      const dateElement = document.getElementById(
        'date-' + formattedSelectedDateLabel
      );

      if (dateElement && listViewContainer) {
        // Scroll the element into view with an offset (for the header)
        // block: 'start' option ensures the element scrolls to the top of the container.
        dateElement.scrollIntoView({
          behavior: 'instant',
          block: 'start',
          inline: 'nearest',
        });
      }
    } else {
      // Get reference to the scroll container
      const listViewContainer = document.querySelector('.scroll-container');

      if (dateElement && listViewContainer) {
        // Scroll the element into view with an offset (for the header)
        // block: 'start' option ensures the element scrolls to the top of the container.
        dateElement.scrollIntoView({
          behavior: 'instant',
          block: 'start',
        });
      }
    }

    // Reset programmatic scroll flag after a delay
    setTimeout(() => {
      this.isProgrammaticScroll = false;
    }, 200);
  }

  /*
   * Load more events when the user scrolls to the top or bottom of the list view
   * @param append - Determines whether to load more events to the previous or next period
   *
   */
  loadMoreEvents(append: 'previous' | 'next'): void {
    // Limit the number of items in the list view
    const maxItems = 200;

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

    if (event.dayPickerViewMode === 'month') {
      // Generate new month view when stepping
      this.currentMonthDays = this.datePickerService.generateMonth(
        this.viewDate,
        0
      );
    } else if (event.dayPickerViewMode === 'week') {
      // Generate new week view when stepping
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
