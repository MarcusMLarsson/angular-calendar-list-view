import { Injectable } from '@angular/core';
import { getISOWeek } from 'date-fns';
import { DatePipe } from '@angular/common';
import { ListView, CalendarEvent } from '../utils/utils';

// Constants for date formats
const DATE_FORMATS = {
  DAY: 'EEEE, MMMM d',
  MONTH: 'MMMM yyyy',
} as const;

@Injectable({
  providedIn: 'root',
})
export class EventGroupingService {
  constructor(private datePipe: DatePipe) {}

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
  ): { dateLabel: string; events: CalendarEvent[] }[] {
    // Generate labels for the current view
    const labels = this.getLabelsForCurrentView(listView, viewDate, append);

    // Map labels to their corresponding events
    return labels.map((label) => ({
      dateLabel: label,
      events: events.filter(
        (event) => this.getDateLabel(event.start, listView) === label
      ),
    }));
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
  ): string[] {
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
  ): string[] {
    // Determine the target month
    const targetStartDate = this.getTargetDate(viewDate, append);
    const labels: string[] = [];

    // Generate labels for each day in the target month
    const currentDate = new Date(targetStartDate);
    const lastDay = new Date(
      currentDate.getFullYear(),
      currentDate.getMonth() + 1,
      0
    );

    while (currentDate <= lastDay) {
      const dateLabel = this.datePipe.transform(currentDate, DATE_FORMATS.DAY);
      if (dateLabel) {
        labels.push(dateLabel);
      }
      currentDate.setDate(currentDate.getDate() + 1);
    }

    return labels;
  }

  /**
   * Generate week labels
   * @param viewDate Current view date
   * @param append Append option
   * @returns Array of week labels
   */
  private generateWeekLabels(
    viewDate: Date,
    append: 'previous' | 'next' | 'none' = 'none'
  ): string[] {
    // Determine the target year
    const targetYear = this.getTargetYear(viewDate, append);
    const labels: string[] = [];

    // Generate week labels for the target year
    const firstDay = new Date(targetYear, 0, 1);
    let currentDate = new Date(firstDay);

    while (currentDate.getFullYear() === targetYear) {
      const weekLabel = `W${getISOWeek(currentDate)}`;
      labels.push(weekLabel);

      // Move to next week
      currentDate.setDate(currentDate.getDate() + 7);
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
  ): string[] {
    // Determine the target month
    const targetDate = this.getTargetDate(viewDate, append);

    // Generate month label
    const monthLabel = this.datePipe.transform(targetDate, DATE_FORMATS.MONTH);
    return monthLabel ? [monthLabel] : [];
  }

  /**
   * Get appropriate date label based on list view
   * @param date Event date
   * @param listView Current list view mode
   * @returns Formatted date label
   */
  private getDateLabel(date: Date, listView: ListView): string {
    switch (listView) {
      case ListView.Day:
        return this.datePipe.transform(date, DATE_FORMATS.DAY) as string;
      case ListView.Week:
        return `W${getISOWeek(date)}`;
      case ListView.Month:
        return this.datePipe.transform(date, DATE_FORMATS.MONTH) as string;
      default:
        return '';
    }
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
}
