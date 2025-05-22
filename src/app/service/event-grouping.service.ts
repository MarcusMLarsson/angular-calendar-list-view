import { Injectable } from '@angular/core';
import { CalendarEvent } from '../utils/utils';

@Injectable({
  providedIn: 'root',
})
export class EventGroupingService {
  constructor() {}

  /**
   * Group events by date for the whole year
   * @param events Array of calendar events
   * @param viewDate The reference date
   * @returns Grouped events with date labels for the entire year
   */
  groupEventsByDate(
    events: CalendarEvent[],
    viewDate: Date
  ): { dateLabel: Date; events: CalendarEvent[] }[] {
    const labels = this.generateYearlyLabels(viewDate);

    const eventsByDateKey = new Map<string, CalendarEvent[]>();

    for (const event of events) {
      const dateKey = this.getDateKey(event.start);
      if (!eventsByDateKey.has(dateKey)) {
        eventsByDateKey.set(dateKey, []);
      }
      eventsByDateKey.get(dateKey)!.push(event);
    }

    return labels.map((label) => ({
      dateLabel: label,
      events: eventsByDateKey.get(this.getDateKey(label)) || [],
    }));
  }

  /**
   * Generate a unique string key for a date (YYYY-MM-DD format)
   * More efficient than comparing date objects
   */
  private getDateKey(date: Date): string {
    return `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`;
  }

  /**
   * Check if two dates are on the same day
   * Kept for backward compatibility, but getDateKey is more efficient
   */
  private isSameDay(date1: Date, date2: Date): boolean {
    return (
      date1.getFullYear() === date2.getFullYear() &&
      date1.getMonth() === date2.getMonth() &&
      date1.getDate() === date2.getDate()
    );
  }

  /**
   * Generate date labels for the entire year based on viewDate
   * @param viewDate The reference date
   * @returns Array of daily labels for the whole year
   */
  private generateYearlyLabels(viewDate: Date): Date[] {
    const year = viewDate.getFullYear();
    const labels: Date[] = [];

    // More efficient: calculate total days and pre-allocate array
    const isLeapYear = (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0;
    const totalDays = isLeapYear ? 366 : 365;

    // Pre-allocate array for better performance
    labels.length = totalDays;

    const startDate = new Date(year, 0, 1);

    for (let i = 0; i < totalDays; i++) {
      const currentDate = new Date(startDate);
      currentDate.setDate(startDate.getDate() + i);
      labels[i] = currentDate;
    }

    return labels;
  }
}
