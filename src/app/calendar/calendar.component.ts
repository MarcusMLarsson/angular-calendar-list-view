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
export class SmartComponent implements OnChanges, OnInit, AfterViewInit {
  /**
   * The current view date
   */
  viewDate: Date = new Date();

  selectedDate = new Date();

  /**
   * An array of events to display on view
   * The schema is available here: https://github.com/mattlewis92/calendar-utils/blob/c51689985f59a271940e30bc4e2c4e1fee3fcb5c/src/calendarUtils.ts#L49-L63
   */
  events: CalendarEvent[] = events;

  /**
   * The list of events grouped daily
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

  /*
   * The current view mode of the day picker
   */
  dayPickerViewMode: 'week' | 'month' = 'week';

  /*
   * Used to prevent that the scrollToSelectedDate method triggers onScroll
   */
  private isProgrammaticScroll = false;
  private lastScrollTop = 0;
  scrollingDown = false;

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
    // Listen to when users select a date in the mobile day picker
    this.calendarListStateService.dayPickerSelectedDate$
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (date: Date) => {
          this.viewDate = date;
          // Recalculate if the user selects a date outside the current list in the day picker
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
        complete: () => {},
      });

    // Listen for the date currently visible at the top of the mobile list view
    this.calendarListStateService.listViewTopDate$
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (date: Date) => {
          //invalid date
          this.selectedDate = this.viewDate = date;
          this.updateDatePickerOnScrollOutOfRange();
        },
        error: (err) => {
          console.error('Error in listViewTopDate$:', err);
        },
        complete: () => {},
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
        // Find the parent event-group-container which has the date ID
        const eventGroupContainer = dateHeaderContainer.closest(
          '.event-group-container'
        );

        if (eventGroupContainer) {
          const dateId = eventGroupContainer.id; // Format: "yyyy-MM-dd"

          if (dateId) {
            // Parse the date from the ID
            const parsedDate = new Date(dateId + 'T00:00:00'); // Add time part to create valid date

            // Set the date in your service
            this.calendarListStateService.setListViewTopDate(parsedDate);
          }
        }

        break;
      }
    }

    if (this.isProgrammaticScroll) return;

    // Get the current scroll position
    const scrollTop = scrollableContainer.scrollTop;

    // Check if scrolling down
    if (scrollTop > this.lastScrollTop) {
      this.scrollingDown = true;
    } else {
      this.scrollingDown = false;
    }

    // Update last scroll position
    this.lastScrollTop = scrollTop <= 0 ? 0 : scrollTop;
  }

  /*
   * Scrolls to the selected date in the calendar list view when a date is clicked in the day picker.
   */
  private scrollToSelectedDate(): void {
    this.isProgrammaticScroll = true;
    // Format the selected date to match the format of the date label in the list view
    const formattedSelectedDateLabel = this.datePipe.transform(
      this.viewDate,
      'yyyy-MM-dd'
    ) as any;

    const listViewContainer = document.querySelector('.scroll-container');

    // Function to scroll the selected date into view and check if the scroll was successful

    const scrollIntoView = () => {
      const dateElement = document.getElementById(formattedSelectedDateLabel);
      if (dateElement && listViewContainer) {
        // First scroll into view
        dateElement.scrollIntoView({
          behavior: 'instant',
          block: 'start',
        });
      }
    };

    scrollIntoView();

    setTimeout(() => {
      this.isProgrammaticScroll = false;
    }, 100);
  }

  /*
   * Step back or forward in the stepper in the the mobile date picker
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

  onViewModeChange(viewMode: 'week' | 'month') {
    this.dayPickerViewMode = viewMode;
  }

  openAddEventDialog() {
    // Implement logic to open your event creation dialog or form
    console.log('Open Add Event Dialog');
  }
}
