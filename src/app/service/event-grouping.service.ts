import { Injectable } from '@angular/core';
import { CalendarListStateService } from './calendar-list-state.service';
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
    // Generate labels for the entire year based on viewDate
    const labels = this.generateYearlyLabels(viewDate);

    // Map labels to their corresponding events
    return labels.map((label) => ({
      dateLabel: label,
      events: events.filter((event) => this.isSameDay(event.start, label)),
    }));
  }

  /**
   * Check if two dates are on the same day
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
    const currentDate = new Date(year, 0, 1); // Start from January 1st

    while (currentDate.getFullYear() === year) {
      labels.push(new Date(currentDate));
      currentDate.setDate(currentDate.getDate() + 1);
    }

    return labels;
  }
}
