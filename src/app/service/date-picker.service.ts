import { Injectable } from '@angular/core';
import {
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  addMonths,
  subMonths,
  addWeeks,
  subWeeks,
  addDays,
  Day,
} from 'date-fns';

@Injectable({
  providedIn: 'root',
})
export class DatePickerService {
  constructor() {}

  /**
   * Step through months or weeks
   */
  navigateDate(
    viewDate: Date,
    step: 'next' | 'previous',
    dayPickerViewMode: 'week' | 'month'
  ): Date {
    if (step === 'next') {
      return dayPickerViewMode === 'month'
        ? addMonths(viewDate, 1)
        : addWeeks(viewDate, 1);
    } else {
      return dayPickerViewMode === 'month'
        ? subMonths(viewDate, 1)
        : subWeeks(viewDate, 1);
    }
  }

  /**
   * Get the days of the current week based on the viewDate
   */
  getWeekDays(
    viewDate: Date,
    weekStartsOn: Day | undefined
  ): Array<{ date: Date; dayNumber: number }> {
    const currentWeekStart = startOfWeek(viewDate, { weekStartsOn });
    return Array.from({ length: 7 }, (_, dayIndex) => {
      const date = addDays(currentWeekStart, dayIndex);
      return {
        date,
        dayNumber: date.getDate(),
      };
    });
  }

  /**
   * Generate the days of the month
   */
  generateMonth(
    viewDate: Date,
    weekStartsOn: Day | undefined
  ): Array<Array<{ date: Date; dayNumber: number }>> {
    const start = startOfMonth(viewDate);
    const end = endOfMonth(viewDate);
    const startDate = startOfWeek(start, { weekStartsOn });
    const endDate = endOfWeek(end, { weekStartsOn });

    let date = startDate;
    const weeks: Array<Array<{ date: Date; dayNumber: number }>> = [];
    let week: Array<{ date: Date; dayNumber: number }> = [];

    while (date <= endDate) {
      week.push({ date: new Date(date), dayNumber: date.getDate() });

      if (week.length === 7) {
        weeks.push(week);
        week = [];
      }

      date = addDays(date, 1);
    }

    return weeks;
  }

  /**
   * Generate abbreviated day names
   */
  generateDayOfWeekAbbreviations(
    viewDate: Date,
    weekStartsOn: Day | undefined
  ): string[] {
    const weekStart = startOfWeek(viewDate, { weekStartsOn });
    return Array.from({ length: 7 }, (_, i) => {
      const day = addDays(weekStart, i);
      return day.toLocaleDateString('en-US', { weekday: 'short' });
    });
  }
}
