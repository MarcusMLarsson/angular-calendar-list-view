import {
  Component,
  Input,
  Output,
  EventEmitter,
  HostListener,
  ElementRef,
  SimpleChanges,
} from '@angular/core';
import { DatePipe } from '@angular/common';
import { DatePickerService } from '../service/date-picker.service';
import { events, CalendarEvent } from '../utils/utils';
import { CalendarListStateService } from '../service/calendar-list-state.service';

@Component({
  selector: 'app-date-picker',
  templateUrl: './date-picker.component.html',
  styleUrls: ['./date-picker.component.scss'],
})
export class DatePickerComponent {
  @Input() dayOfWeekAbbreviations!: string[];
  @Input() currentMonthDays!: Array<Array<{ date: Date; dayNumber: number }>>;
  @Input() viewDate: Date = new Date();
  @Input() currentWeekDays!: Array<{ date: Date; dayNumber: number }>;
  @Input() groupedEventsByDate: { dateLabel: Date; events: CalendarEvent[] }[] =
    [];
  @Input() selectedDate = new Date();

  @Output() changeStep = new EventEmitter<{
    step: 'next' | 'previous';
    dayPickerViewMode: 'week' | 'month';
  }>();

  @Output() viewModeChange = new EventEmitter<'week' | 'month'>();

  bookedDatesMap: Map<string, any[]> = new Map();
  dayPickerViewMode: 'week' | 'month' = 'week';
  weekStartsOn = 1;
  today = new Date();

  private touchStartX = 0;
  private touchEndX = 0;
  private touchStartY = 0;
  private touchEndY = 0;
  private swipeDistanceX = 0;
  private swipeDistanceY = 0;
  private swipeThreshold = 30;

  constructor(
    public datePipe: DatePipe,
    private calendarListStateService: CalendarListStateService,
    private datePickerService: DatePickerService,
    private el: ElementRef
  ) {}

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['groupedEventsByDate']) {
      this.updateBookedDatesMap();
    }
  }

  updateBookedDatesMap(): void {
    this.bookedDatesMap.clear();
    this.groupedEventsByDate.forEach((event) => {
      const dateString = this.getDateString(event.dateLabel);
      this.bookedDatesMap.set(dateString, event.events);
    });
  }

  dayHasBooking(date: Date): number {
    const dateString = this.getDateString(date);
    const events = this.bookedDatesMap.get(dateString);
    return events ? events.length : 0;
  }

  getDateString(date: Date): string {
    return date.toISOString().split('T')[0];
  }

  getIndicatorCount(date: Date): number[] {
    const bookingCount = this.dayHasBooking(date);
    return Array(Math.min(bookingCount, 2)).fill(0);
  }

  toggleView() {
    this.dayPickerViewMode =
      this.dayPickerViewMode === 'week' ? 'month' : 'week';
    this.viewModeChange.emit(this.dayPickerViewMode);
    this.currentMonthDays = this.datePickerService.generateMonth(this.viewDate);
  }

  isSameMonth(date: Date): boolean {
    return date.getMonth() === this.viewDate.getMonth();
  }

  isToday(date: Date): boolean {
    return (
      date.getDate() === this.today.getDate() &&
      date.getMonth() === this.today.getMonth() &&
      date.getFullYear() === this.today.getFullYear()
    );
  }

  onDateClick(date: Date): void {
    if (
      this.swipeDistanceX > this.swipeThreshold ||
      this.swipeDistanceY > this.swipeThreshold
    ) {
      return;
    }

    this.selectedDate = date;
    this.calendarListStateService.setDayPickerSelectedDate(date);

    if (!this.isSameMonth(date) && this.dayPickerViewMode === 'month') {
      if (date.getDate() < 15) {
        this.goToNextStep(this.dayPickerViewMode);
      } else {
        this.goToPreviousStep(this.dayPickerViewMode);
      }
    }
  }

  goToPreviousStep(dayPickerViewMode: 'week' | 'month'): void {
    this.changeStep.emit({ step: 'previous', dayPickerViewMode });
  }

  goToNextStep(dayPickerViewMode: 'week' | 'month'): void {
    this.changeStep.emit({ step: 'next', dayPickerViewMode });
  }

  getAdjustedDayIndex(day: Date): number {
    const dayIndex = day.getDay();
    return (dayIndex - this.weekStartsOn + 7) % 7;
  }

  @HostListener('touchstart', ['$event'])
  onTouchStart(event: TouchEvent) {
    this.touchStartX = event.touches[0].clientX;
    this.touchStartY = event.touches[0].clientY;
    this.swipeDistanceX = this.swipeDistanceY = 0;
  }

  @HostListener('touchmove', ['$event'])
  onTouchMove(event: TouchEvent) {
    this.touchEndX = event.touches[0].clientX;
    this.touchEndY = event.touches[0].clientY;

    this.swipeDistanceX = Math.abs(this.touchStartX - this.touchEndX);
    this.swipeDistanceY = Math.abs(this.touchStartY - this.touchEndY);
  }

  @HostListener('touchend', ['$event'])
  onTouchEnd(event: TouchEvent) {
    if (
      this.swipeDistanceX > this.swipeThreshold ||
      this.swipeDistanceY > this.swipeThreshold
    ) {
      this.handleSwipe();

      event.preventDefault();
      event.stopPropagation();
    }

    this.swipeDistanceX = this.swipeDistanceY = 0;
  }

  private handleSwipe() {
    const swipeThreshold = 30;

    // Only handle horizontal swipes (left or right)
    if (Math.abs(this.touchStartX - this.touchEndX) > swipeThreshold) {
      const direction = this.touchStartX > this.touchEndX ? 'next' : 'previous';

      // Apply sliding animation to each date element
      const dateElements = this.el.nativeElement.querySelectorAll(
        '.day-of-the-week, .day-of-the-month'
      );
      const selectedElement = this.el.nativeElement.querySelector('.selected');
      const todayElement = this.el.nativeElement.querySelector('.today');
      dateElements.forEach((el: HTMLElement) => {
        el.classList.add(direction === 'next' ? 'slide-left' : 'slide-right');
      });

      // Apply fade-out animation to selected and today elements so they don't flicker
      if (selectedElement) {
        selectedElement.classList.add('fade-out');
      }

      if (todayElement) {
        todayElement.classList.add('fade-out');
      }

      setTimeout(() => {
        dateElements.forEach((el: HTMLElement) =>
          el.classList.remove('slide-left', 'slide-right')
        );

        if (selectedElement) {
          selectedElement.classList.remove('fade-out');
        }

        if (todayElement) {
          todayElement.classList.remove('fade-out');
        }

        if (direction === 'next') {
          this.goToNextStep(this.dayPickerViewMode);
        } else {
          this.goToPreviousStep(this.dayPickerViewMode);
        }
      }, 250);
    }

    if (
      this.touchEndY - this.touchStartY > swipeThreshold &&
      this.dayPickerViewMode === 'week'
    ) {
      this.dayPickerViewMode = 'month';
      this.viewModeChange.emit(this.dayPickerViewMode);
      this.currentMonthDays = this.datePickerService.generateMonth(
        this.viewDate
      );
    } else if (
      this.touchStartY - this.touchEndY > swipeThreshold &&
      this.dayPickerViewMode === 'month'
    ) {
      this.dayPickerViewMode = 'week';
      this.viewModeChange.emit(this.dayPickerViewMode);
    }
  }

  trackByIndex(index: number): number {
    return index;
  }

  trackByDate(index: number, day: { date: Date; dayNumber: number }): number {
    return day.date.getTime();
  }
}
