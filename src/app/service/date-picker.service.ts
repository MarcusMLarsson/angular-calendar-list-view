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
} from 'date-fns';
import { ConfigService } from './config.service';
import { WeekStart } from '../utils/utils';

@Injectable({
  providedIn: 'root',
})
export class DatePickerService {
  weekStartsOn: WeekStart = this.configService.getWeekStartOn();

  constructor(private configService: ConfigService) {}

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
  getWeekDays(viewDate: Date): Array<{ date: Date; dayNumber: number }> {
    // Use date-fns startOfWeek with dynamic weekStartsOn value
    const currentWeekStart = startOfWeek(viewDate, {
      weekStartsOn: this.weekStartsOn,
    });

    // Correcting the days of the week to start from the desired day
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
    viewDate: Date
  ): Array<Array<{ date: Date; dayNumber: number }>> {
    // Calculate the start and end of the month
    const start = startOfMonth(viewDate);
    const end = endOfMonth(viewDate);

    // Calculate the start and end of the week that contains the first and last day of the month
    const startDate = startOfWeek(start, { weekStartsOn: this.weekStartsOn });
    const endDate = endOfWeek(end, { weekStartsOn: this.weekStartsOn });

    let date = startDate;
    const weeks: Array<Array<{ date: Date; dayNumber: number }>> = [];
    let week: Array<{ date: Date; dayNumber: number }> = [];

    // Iterate through days from startDate to endDate, grouping by weeks
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
  generateDayOfWeekAbbreviations(viewDate: Date): string[] {
    // Get the start of the week based on the viewDate and weekStartsOn
    const weekStart = startOfWeek(viewDate, {
      weekStartsOn: this.weekStartsOn,
    });

    // Generate abbreviated day names based on the start of the week
    return Array.from({ length: 7 }, (_, i) => {
      const day = addDays(weekStart, i);
      return day.toLocaleDateString('en-US', { weekday: 'short' });
    });
  }
}
