import {
  Component,
  inject,
  DestroyRef,
  SimpleChanges,
  ChangeDetectorRef,
  OnChanges,
  OnInit,
  AfterViewInit,
  ViewChild,
  ElementRef,
} from '@angular/core';
import { StateService } from '../service/state.service';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { events, CalendarEvent } from '../utils/utils';
import { startOfMonth } from 'date-fns';
import { DatePipe } from '@angular/common';
import { EventGroupingService } from '../service/event-grouping.service';
import { DatePickerService } from '../service/date-picker.service';
import { ConfigService } from '../service/config.service';
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

  /*
   * Used to prevent that the scrollToSelectedDate method triggers onScroll
   */
  private isProgrammaticScroll = false;

  private destroyRef = inject(DestroyRef);
  @ViewChild('scrollableContainer') scrollableContainer!: ElementRef;
  @ViewChild('referenceElement') referenceElement!: ElementRef;

  constructor(
    private calendarListStateService: StateService,
    private datePipe: DatePipe,
    private cdr: ChangeDetectorRef,
    private eventGroupingService: EventGroupingService,
    private datePickerService: DatePickerService,
    private configService: ConfigService
  ) {}

  ngOnInit() {
    this.initializeSubscriptions();

    // Initialize the current week, month days, and day abbreviations to be displayed in the day picker
    this.currentWeekDays = this.datePickerService.getWeekDays(this.viewDate);
    this.currentMonthDays = this.datePickerService.generateMonth(this.viewDate);
    this.dayOfWeekAbbreviations =
      this.datePickerService.generateDayOfWeekAbbreviations(this.viewDate);
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['events']) {
      // recalculate the grouped events when the events or listView changes
      this.groupedEventsByDate = this.eventGroupingService.groupEventsByDate(
        this.events,
        this.viewDate
      );
    }
  }

  ngAfterViewInit(): void {
    // Scrolls to today's date when the component is initialized
    this.scrollToDate(this.viewDate, 5);
  }

  private initializeSubscriptions(): void {
    // Create a flag to track recent day picker interaction
    // Needed since both the scroll and the day picker update the selected date, which can cause conflicts
    // If the day picker was recently used, the day picker selected date should take priority
    let dayPickerPriority = false;
    let firstRun = true;

    this.calendarListStateService.dayPickerSelectedDate$
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((date: Date) => {
        dayPickerPriority = true;
        this.viewDate = date;
        this.groupedEventsByDate = this.eventGroupingService.groupEventsByDate(
          this.events,
          this.viewDate
        );

        this.cdr.detectChanges();

        if (!firstRun) {
          this.scrollToSelectedDate();
        }

        firstRun = false;
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

    this.calendarListStateService.lastScrolledDate$
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((lastScrolledDate) => {
        this.scrollToDate(startOfMonth(lastScrolledDate));
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
          this.viewDate
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
        this.currentWeekDays = this.datePickerService.getWeekDays(
          this.viewDate
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
          let fullDateString = '';
          // Combine the weekday and month-year label parts into a full date.

          fullDateString = `${weekdayHeader} ${monthYearHeader}`;

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
      // Call the loadMoreEvents function (this could add or remove items)
      this.groupedEventsByDate = this.eventGroupingService.loadMoreEvents(
        this.events,
        this.groupedEventsByDate,
        this.viewDate,
        'previous'
      );
    } else if (
      scrollableContainer.scrollHeight - scrollableContainer.scrollTop ===
      scrollableContainer.clientHeight
    ) {
      // Scrolled to the bottom - Load next events
      this.groupedEventsByDate = this.eventGroupingService.loadMoreEvents(
        this.events,
        this.groupedEventsByDate,
        this.viewDate,
        'next'
      );
    }
  }

  /*
   * Scrolls to the selected date in the calendar list view when a date is clicked in the day picker.
   */
  private scrollToSelectedDate(): void {
    this.isProgrammaticScroll = true;

    // Format the selected date to match the date label in the list view
    // date format needs to match the date label in the list view
    // Date format needs to match the date label in the list view
    let formattedSelectedDateLabel = this.datePipe.transform(
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
      if (this.viewDate.getDate() > 15) {
        this.groupedEventsByDate = this.eventGroupingService.loadMoreEvents(
          this.events,
          this.groupedEventsByDate,
          this.viewDate,
          'previous'
        );
        this.cdr.detectChanges();
      } else {
        this.groupedEventsByDate = this.eventGroupingService.loadMoreEvents(
          this.events,
          this.groupedEventsByDate,
          this.viewDate,
          'next'
        );
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
        this.viewDate
      );
    } else if (event.dayPickerViewMode === 'week') {
      // Generate new week view when stepping
      this.currentWeekDays = this.datePickerService.getWeekDays(this.viewDate);
    }
  }

  private scrollToDate(viewDate: Date, offset: number = 0): void {
    // Format the selected date to match the date label in the list view
    let formattedSelectedDateLabel = this.datePipe.transform(
      viewDate,
      'yyyy-MM-dd'
    );

    // Find the DOM element that matches the selected date label
    const dateElement = document.getElementById(
      'date-' + formattedSelectedDateLabel
    );

    const listViewContainer = document.querySelector('.scroll-container');

    if (dateElement && listViewContainer) {
      // Scroll the element into view with an offset (for the header)
      requestAnimationFrame(() => {
        dateElement.scrollIntoView({
          behavior: 'instant',
          block: 'start',
        });
        // Add a small delay to account for the scroll, then apply the offset
        setTimeout(() => {
          if (listViewContainer instanceof HTMLElement) {
            listViewContainer.scrollTop += offset; // Subtract 5 pixels from the scrollTop value
          }
        }, 0);
      });
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
