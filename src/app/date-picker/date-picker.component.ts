import { Component, DestroyRef, Input, OnInit, inject } from '@angular/core';
import { DatePipe } from '@angular/common';
import { StateService } from '../service/state.service';
import {
  Day,
  startOfWeek,
  addDays,
  startOfMonth,
  endOfMonth,
  endOfWeek,
} from 'date-fns';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

@Component({
  selector: 'app-date-picker',
  templateUrl: './date-picker.component.html',
  styleUrls: ['./date-picker.component.scss'],
})
export class DatePickerComponent implements OnInit {
  dayAbbreviations: string[] = [];
  monthDays: Array<Array<{ date: Date; dayNumber: number }>> = [];
  selectedDate!: Date;
  isExpanded: boolean = false;

  weekStartsOn: Day | undefined;
  @Input() viewDate: Date = new Date();

  private destroyRef = inject(DestroyRef);

  constructor(
    public datePipe: DatePipe,
    private calendarListStateService: StateService
  ) {}

  ngOnInit() {
    this.generateDayInitials();
    this.generateMonthDays();

    // listens to when the user select a day in the day picker
    this.calendarListStateService.dayPickerSelectedDate$
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((date: Date) => {
        this.selectedDate = date;
      });

    // listens to when the user scrolls in the list
    this.calendarListStateService.listViewScrolledDate$
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((date: Date) => {
        this.selectedDate = date;
      });
  }

  /*
   * Expands or contract the day picker  *
   */
  toggleView() {
    this.isExpanded = !this.isExpanded;
  }

  /*
   * Returns the day abbreviation for the given date *
   */
  getDayAbbreviation(date: Date): string {
    return this.datePipe.transform(date, 'EEE') || '';
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

  /*
   * Returns true if the given date is the selected date *
   * Used to highlight the selected date in blue *
   */
  isSelectedDay(date: Date): boolean {
    return (
      this.selectedDate &&
      date.getDate() === this.selectedDate.getDate() &&
      date.getMonth() === this.selectedDate.getMonth() &&
      date.getFullYear() === this.selectedDate.getFullYear()
    );
  }

  /*
   * Returns true if the given date is in the same month as the view date *
   * Used to highlight the selected date in blue *
   */
  isSameMonth(date: Date): boolean {
    return date.getMonth() === this.viewDate.getMonth();
  }

  /*
   * Called when a date is clicked *
   * Sets the selected date to the clicked date *
   */
  onDateClick(date: Date): void {
    this.calendarListStateService.setDayPickerSelectedDate(date);
  }
}
