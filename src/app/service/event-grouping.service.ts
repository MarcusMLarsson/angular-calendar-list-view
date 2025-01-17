import { Injectable } from '@angular/core';
import {
  addMonths,
  addWeeks,
  getISOWeek,
  subMonths,
  startOfWeek,
  getISOWeekYear,
  getISOWeeksInYear,
} from 'date-fns';
import { ListView, CalendarEvent, WeekStart } from '../utils/utils';
import { StateService } from './state.service';
import { ConfigService } from './config.service';

@Injectable({
  providedIn: 'root',
})
export class EventGroupingService {
  private weekStartsOn: WeekStart = this.configService.getWeekStartOn();

  constructor(
    private stateService: StateService,
    private configService: ConfigService
  ) {}

  /**
   * Group events by date based on the current list view
   * @param events Array of calendar events
   * @param listView Current list view mode (Day/Week/Month)
   * @param viewDate Current view date
   * @param append Option to append previous or next period
   * @returns Grouped events with date labels
   */
  groupEventsByDate(
    events: CalendarEvent[],
    listView: ListView,
    viewDate: Date,
    append: 'previous' | 'next' | 'none' = 'none'
  ): { dateLabel: Date; events: CalendarEvent[] }[] {
    // Generate labels for the current view
    const labels = this.getLabelsForCurrentView(listView, viewDate, append);

    // Map labels to their corresponding events
    return labels.map((label) => ({
      dateLabel: label,
      events: events.filter((event) =>
        this.isEventInLabel(event, label, listView)
      ),
    }));
  }

  /**
   * Check if an event belongs to a specific date label based on list view
   * @param event Calendar event to check
   * @param label Date label to match against
   * @param listView Current list view mode
   * @returns Boolean indicating if event matches the label
   */
  private isEventInLabel(
    event: CalendarEvent,
    label: Date,
    listView: ListView
  ): boolean {
    switch (listView) {
      case ListView.Day:
        return this.isSameDay(event.start, label);
      case ListView.Week:
        return this.isEventInWeek(event.start, label);
      case ListView.Month:
        return this.isSameMonth(event.start, label);
      default:
        return false;
    }
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
   * Check if an event falls within the same week as the label
   * @param eventDate Date of the event
   * @param weekLabel Week label date
   * @returns Boolean indicating if event is in the same week
   */
  private isEventInWeek(eventDate: Date, weekLabel: Date): boolean {
    const eventYear = eventDate.getFullYear();
    const eventWeek = getISOWeek(eventDate);
    const labelWeek = getISOWeek(weekLabel);
    const labelYear = weekLabel.getFullYear();

    return eventYear === labelYear && eventWeek === labelWeek;
  }

  /**
   * Check if two dates are in the same month
   * @param date1 First date
   * @param date2 Second date
   * @returns Boolean indicating if dates are in the same month
   */
  private isSameMonth(date1: Date, date2: Date): boolean {
    return (
      date1.getFullYear() === date2.getFullYear() &&
      date1.getMonth() === date2.getMonth()
    );
  }

  /**
   * Get appropriate labels based on list view
   * @param listView Current list view mode
   * @param viewDate Current view date
   * @param append Append option
   * @returns Array of date labels
   */
  private getLabelsForCurrentView(
    listView: ListView,
    viewDate: Date,
    append: 'previous' | 'next' | 'none'
  ): Date[] {
    switch (listView) {
      case ListView.Day:
        return this.generateDailyLabels(viewDate, append);
      case ListView.Week:
        return this.generateWeekLabels(viewDate, append);
      case ListView.Month:
        return this.generateMonthLabels(viewDate, append);
      default:
        return [];
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
   * Generate week labels with correct ISO week numbering
   * @param viewDate Current view date
   * @param append Append option
   * @returns Array of week labels
   */

  //TODO, week calculating is wrong sometimes
  private generateWeekLabels(
    viewDate: Date,
    append: 'previous' | 'next' | 'none' = 'none'
  ): Date[] {
    const targetYear = this.getTargetYear(viewDate, append); // Get the ISO year for the provided date
    const numberOfWeeks = getISOWeeksInYear(new Date(targetYear, 0, 1)); // Number of ISO weeks in the year
    const labels: Date[] = [];

    // Start from the first week of the ISO year
    let startDate = startOfWeek(new Date(targetYear, 0, 4), {
      weekStartsOn: this.weekStartsOn,
    });

    for (let i = 0; i < numberOfWeeks; i++) {
      labels.push(startDate);
      startDate = addWeeks(startDate, 1); // Move to the next week
    }

    return labels;
  }

  /**
   * Generate month labels
   * @param viewDate Current view date
   * @param append Append option
   * @returns Array of month labels
   */
  private generateMonthLabels(
    viewDate: Date,
    append: 'previous' | 'next' | 'none' = 'none'
  ): Date[] {
    const targetDate = this.getTargetDate(viewDate, append);
    return [new Date(targetDate)];
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
   * Determine target year based on append option
   * @param currentDate Current view date
   * @param append Append option
   * @returns Adjusted target year
   */
  private getTargetYear(
    currentDate: Date,
    append: 'previous' | 'next' | 'none' = 'none'
  ): number {
    const currentYear = getISOWeekYear(currentDate); // ISO year of the current date
    switch (append) {
      case 'previous':
        return getISOWeekYear(subMonths(currentDate, 1)); // Adjust by one month backward
      case 'next':
        return getISOWeekYear(addMonths(currentDate, 1)); // Adjust by one month forward
      default:
        return currentYear;
    }
  }

  /**
   * Load more events to the grouped events based on the current view
   * @param events Array of calendar events
   * @param listView Current list view mode (Day/Week/Month)
   * @param viewDate Current view date
   * @param append Determines whether to load more events to the previous or next period
   * @param groupedEvents Current grouped events by date
   * @returns Updated grouped events with new events added
   */
  loadMoreEvents(
    events: CalendarEvent[],
    groupedEvents: { dateLabel: Date; events: CalendarEvent[] }[],
    listView: ListView,
    viewDate: Date,
    append: 'previous' | 'next'
  ): { dateLabel: Date; events: CalendarEvent[] }[] {
    const newGroupedEvents = this.groupEventsByDate(
      events,
      listView,
      viewDate,
      append
    );

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
