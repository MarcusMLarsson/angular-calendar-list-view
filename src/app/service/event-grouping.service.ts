import { Injectable } from '@angular/core';
import { addMonths, subMonths } from 'date-fns';
import { CalendarEvent, WeekStart } from '../utils/utils';
import { StateService } from './state.service';
import { ConfigService } from './config.service';

@Injectable({
  providedIn: 'root',
})
export class EventGroupingService {
  constructor(private stateService: StateService) {}

  /**
   * Group events by date
   * @param events Array of calendar events
   * @param viewDate Current view date
   * @param append Option to append previous or next period
   * @returns Grouped events with date labels
   */
  groupEventsByDate(
    events: CalendarEvent[],
    viewDate: Date,
    append: 'previous' | 'next' | 'none' = 'none'
  ): { dateLabel: Date; events: CalendarEvent[] }[] {
    // Generate labels for the current view
    const labels = this.generateDailyLabels(viewDate, append);

    // Map labels to their corresponding events
    return labels.map((label) => ({
      dateLabel: label,
      events: events.filter((event) => this.isSameDay(event.start, label)),
    }));
  }

  /**
   * Check if two dates are on the same day
   * @param date1 First date
   * @param date2 Second date
   * @returns Boolean indicating if dates are on the same day
   */
  private isSameDay(date1: Date, date2: Date): boolean {
    return (
      date1.getFullYear() === date2.getFullYear() &&
      date1.getMonth() === date2.getMonth() &&
      date1.getDate() === date2.getDate()
    );
  }

  /**
   * Determine target date based on append option
   * @param currentDate Current view date
   * @param append Append option
   * @returns Adjusted target date
   */
  private getTargetDate(
    viewDate: Date,
    append: 'previous' | 'next' | 'none' = 'none'
  ): Date {
    switch (append) {
      case 'previous':
        return new Date(viewDate.getFullYear(), viewDate.getMonth() - 1, 1);
      case 'next':
        return new Date(viewDate.getFullYear(), viewDate.getMonth() + 1, 1);
      default:
        return new Date(viewDate.getFullYear(), viewDate.getMonth(), 1);
    }
  }

  /**
   * Generate date labels for daily view
   * @param viewDate Current view date
   * @param append Append option
   * @returns Array of daily labels
   */
  private generateDailyLabels(
    viewDate: Date,
    append: 'previous' | 'next' | 'none' = 'none'
  ): Date[] {
    const targetStartDate = this.getTargetDate(viewDate, append);
    const labels: Date[] = [];

    let startDate = new Date(targetStartDate);
    const endDate = new Date(
      startDate.getFullYear(),
      startDate.getMonth() + 1,
      0
    );

    while (startDate <= endDate) {
      labels.push(new Date(startDate));
      startDate.setDate(startDate.getDate() + 1);
    }

    return labels;
  }

  /**
   * Load more events to the grouped events based on the current view
   * @param events Array of calendar events
   * @param viewDate Current view date
   * @param append Determines whether to load more events to the previous or next period
   * @param groupedEvents Current grouped events by date
   * @returns Updated grouped events with new events added
   */
  loadMoreEvents(
    events: CalendarEvent[],
    groupedEvents: { dateLabel: Date; events: CalendarEvent[] }[],
    viewDate: Date,
    append: 'previous' | 'next'
  ): { dateLabel: Date; events: CalendarEvent[] }[] {
    const newGroupedEvents = this.groupEventsByDate(events, viewDate, append);

    // Maximum number of items in the list
    const maxItems = 300;

    // Update the last scrolled date in the StateService

    if (append === 'previous') {
      this.stateService.setLastScrolledDate(viewDate);
      viewDate = subMonths(viewDate, 1);
      groupedEvents = [...newGroupedEvents, ...groupedEvents];
    } else if (append === 'next') {
      // Adjust the viewDate to the next period (e.g., next month)
      viewDate = addMonths(viewDate, 1);
      groupedEvents = [...groupedEvents, ...newGroupedEvents];
    }

    // Ensure that the number of events does not exceed maxItems
    if (groupedEvents.length > maxItems) {
      if (append === 'previous') {
        groupedEvents = groupedEvents.slice(0, maxItems);
      } else {
        groupedEvents = groupedEvents.slice(-maxItems);
      }
    }

    return groupedEvents;
  }
}
