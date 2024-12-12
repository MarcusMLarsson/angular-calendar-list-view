import { Injectable } from '@angular/core';
import { getISOWeek } from 'date-fns';
import { DatePipe } from '@angular/common';
import { ListView, CalendarEvent } from '../utils/utils'; // adjust the import

@Injectable({
  providedIn: 'root',
})
export class EventGroupingService {
  constructor(private datePipe: DatePipe) {}

  groupEventsByDate(
    events: CalendarEvent[],
    listView: ListView,
    viewDate: Date,
    append: 'previous' | 'next' | 'none' = 'none'
  ): { dateLabel: string; events: CalendarEvent[] }[] {
    const labels: string[] = this.getLabelsForCurrentView(
      listView,
      viewDate,
      append
    );

    const groupedEvents = new Map<string, CalendarEvent[]>();

    labels.forEach((label) => groupedEvents.set(label, []));
    for (const event of events) {
      const dateLabel = this.getDateLabel(event.start, listView);
      if (groupedEvents.has(dateLabel)) {
        groupedEvents.get(dateLabel)!.push(event);
      }
    }

    return Array.from(groupedEvents.entries()).map(([dateLabel, events]) => ({
      dateLabel,
      events,
    }));
  }

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

  private generateDailyLabels(
    viewDate: Date,
    append: 'previous' | 'next' | 'none'
  ): string[] {
    const labels: string[] = [];
    const currentMonthStart = new Date(
      viewDate.getFullYear(),
      viewDate.getMonth(),
      1
    );

    let targetStartDate: Date;

    if (append === 'previous') {
      targetStartDate = new Date(
        currentMonthStart.setMonth(currentMonthStart.getMonth() - 1)
      );
    } else if (append === 'next') {
      targetStartDate = new Date(
        currentMonthStart.setMonth(currentMonthStart.getMonth() + 1)
      );
    } else {
      targetStartDate = new Date(currentMonthStart);
    }

    const firstDayOfTargetMonth = new Date(
      targetStartDate.getFullYear(),
      targetStartDate.getMonth(),
      1
    );
    const lastDayOfTargetMonth = new Date(
      targetStartDate.getFullYear(),
      targetStartDate.getMonth() + 1,
      0
    );

    while (firstDayOfTargetMonth <= lastDayOfTargetMonth) {
      const dateLabel = this.datePipe.transform(
        firstDayOfTargetMonth,
        'EEEE, MMMM d'
      );
      if (dateLabel) {
        labels.push(dateLabel);
      }
      firstDayOfTargetMonth.setDate(firstDayOfTargetMonth.getDate() + 1);
    }

    return labels;
  }

  private generateWeekLabels(
    viewDate: Date,
    append: 'previous' | 'next' | 'none'
  ): string[] {
    const labels: string[] = [];
    const currentYearStart = new Date(viewDate.getFullYear(), 0, 1);

    let targetStartDate: Date;

    if (append === 'previous') {
      targetStartDate = new Date(
        currentYearStart.setFullYear(currentYearStart.getFullYear() - 1)
      );
    } else if (append === 'next') {
      targetStartDate = new Date(
        currentYearStart.setFullYear(currentYearStart.getFullYear() + 1)
      );
    } else {
      targetStartDate = new Date(currentYearStart);
    }

    const firstDayOfTargetYear = new Date(targetStartDate.getFullYear(), 0, 1);
    let weekNumber = this.getWeekNumber(firstDayOfTargetYear);

    while (
      firstDayOfTargetYear.getFullYear() === targetStartDate.getFullYear()
    ) {
      labels.push(weekNumber);
      firstDayOfTargetYear.setDate(firstDayOfTargetYear.getDate() + 7);
      weekNumber = this.getWeekNumber(firstDayOfTargetYear);
    }

    return labels;
  }

  private generateMonthLabels(
    viewDate: Date,
    append: 'previous' | 'next' | 'none'
  ): string[] {
    const labels: string[] = [];
    const currentMonth = viewDate.getMonth();
    const currentYear = viewDate.getFullYear();

    let targetMonthStartDate: Date;

    if (append === 'previous') {
      targetMonthStartDate = new Date(currentYear, currentMonth - 1, 1);
    } else if (append === 'next') {
      targetMonthStartDate = new Date(currentYear, currentMonth + 1, 1);
    } else {
      targetMonthStartDate = new Date(currentYear, currentMonth, 1);
    }

    const monthLabel = this.datePipe.transform(
      targetMonthStartDate,
      'MMMM yyyy'
    );
    if (monthLabel) {
      labels.push(monthLabel);
    }

    return labels;
  }

  private getDateLabel(date: Date, listView: ListView): string {
    switch (listView) {
      case ListView.Day:
        return this.datePipe.transform(date, 'EEEE, MMMM d') as string;
      case ListView.Week:
        return this.getWeekNumber(date);
      case ListView.Month:
        return this.datePipe.transform(date, 'MMMM yyyy') as string;
      default:
        return '';
    }
  }

  private getWeekNumber(date: Date): string {
    const weekNumber = getISOWeek(date);
    return `W${weekNumber}`;
  }
}
