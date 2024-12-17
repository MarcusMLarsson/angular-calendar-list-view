import { Injectable } from '@angular/core';
import { addMonths, getISOWeek, subMonths } from 'date-fns';
import { ListView, CalendarEvent } from '../utils/utils';

@Injectable({
  providedIn: 'root',
})
export class EventGroupingService {
  constructor() {}

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

    let currentDate = new Date(targetStartDate);
    const lastDay = new Date(
      currentDate.getFullYear(),
      currentDate.getMonth() + 1,
      0
    );

    while (currentDate <= lastDay) {
      labels.push(new Date(currentDate));
      currentDate.setDate(currentDate.getDate() + 1);
    }

    return labels;
  }

  /**
   * Generate week labels with correct ISO week numbering
   * @param viewDate Current view date
   * @param append Append option
   * @returns Array of week labels
   */
  private generateWeekLabels(
    viewDate: Date,
    append: 'previous' | 'next' | 'none' = 'none'
  ): Date[] {
    const targetYear = this.getTargetYear(viewDate, append);
    const labels: Date[] = [];

    // Determine the number of weeks to generate
    const weeksToGenerate = 52; // Typical number of weeks in a year

    // Calculate the starting week based on the view date
    const startWeek = getISOWeek(viewDate);
    const startDate = new Date(viewDate);

    // Adjust to the first day (Monday) of the current week
    while (startDate.getDay() !== 1) {
      startDate.setDate(startDate.getDate() - 1);
    }

    // Generate week labels
    for (let i = 0; i < weeksToGenerate; i++) {
      const weekDate = new Date(startDate);
      weekDate.setDate(startDate.getDate() + i * 7);

      // Ensure we're still in the target year
      if (weekDate.getFullYear() !== targetYear) break;

      const currentWeek = getISOWeek(weekDate);

      // Only add unique weeks
      if (
        labels.length === 0 ||
        currentWeek !== getISOWeek(labels[labels.length - 1])
      ) {
        labels.push(weekDate);
      }
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
    currentDate: Date,
    append: 'previous' | 'next' | 'none' = 'none'
  ): Date {
    switch (append) {
      case 'previous':
        return new Date(
          currentDate.getFullYear(),
          currentDate.getMonth() - 1,
          1
        );
      case 'next':
        return new Date(
          currentDate.getFullYear(),
          currentDate.getMonth() + 1,
          1
        );
      default:
        return new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
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
    switch (append) {
      case 'previous':
        return currentDate.getFullYear() - 1;
      case 'next':
        return currentDate.getFullYear() + 1;
      default:
        return currentDate.getFullYear();
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
    const maxItems = 100;

    if (append === 'previous') {
      // Adjust the viewDate to the previous period (e.g., previous month)
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
