import {
  Directive,
  HostListener,
  Input,
  Output,
  EventEmitter,
} from '@angular/core';
import { DateAdapter } from '../../../date-adapters/date-adapter';
import { CalendarView } from '../calendar-view/calendar-view.enum';
import { addDaysWithExclusions } from '../util/util';
import { ListView } from '../calendar-view/list-view.enum';

/**
 * Change the view date to the previous view. For example:
 *
 * ```typescript
 * <button
 *  mwlCalendarPreviousView
 *  [(viewDate)]="viewDate"
 *  [view]="view">
 *  Previous
 * </button>
 * ```
 */
@Directive({
  selector: '[mwlCalendarPreviousView]',
})
export class CalendarPreviousViewDirective {
  /**
   * The current view
   */
  @Input() view: CalendarView | 'month' | 'week' | 'day' | 'list';

  @Input() listView: ListView;

  /**
   * The current view date
   */
  @Input() viewDate: Date;

  /**
   * Days to skip when going back by 1 day
   */
  @Input() excludeDays: number[] = [];

  /**
   * The number of days in a week. If set will subtract this amount of days instead of 1 week
   */
  @Input() daysInWeek: number;

  /**
   * Called when the view date is changed
   */
  @Output() viewDateChange: EventEmitter<Date> = new EventEmitter();

  constructor(private dateAdapter: DateAdapter) {}

  /**
   * @hidden
   */
  @HostListener('click')
  onClick(): void {
    const subFn: any = {
      day: this.dateAdapter.subDays,
      week: this.dateAdapter.subWeeks,
      month: this.dateAdapter.subMonths,
      list: this.dateAdapter.addDays,
    }[this.view];

    if (this.view === CalendarView.Day) {
      this.viewDateChange.emit(
        addDaysWithExclusions(
          this.dateAdapter,
          this.viewDate,
          -1,
          this.excludeDays
        )
      );
    } else if (this.view === CalendarView.Week && this.daysInWeek) {
      this.viewDateChange.emit(
        addDaysWithExclusions(
          this.dateAdapter,
          this.viewDate,
          -this.daysInWeek,
          this.excludeDays
        )
      );
    } else if (this.view === CalendarView.List) {
      switch (this.listView) {
        case ListView.Day:
          this.viewDateChange.emit(
            addDaysWithExclusions(
              this.dateAdapter,
              this.viewDate,
              -1,
              this.excludeDays
            )
          );
          break;
        case ListView.Week:
          this.daysInWeek = 7;
          this.viewDateChange.emit(
            addDaysWithExclusions(
              this.dateAdapter,
              this.viewDate,
              -this.daysInWeek,
              this.excludeDays
            )
          );
          break;
        case ListView.Month:
          this.viewDateChange.emit(
            this.dateAdapter.subMonths(this.viewDate, 1)
          );
          break;
        default: {
          this.viewDateChange.emit(subFn(this.viewDate, 1));
        }
      }
    } else {
      this.viewDateChange.emit(subFn(this.viewDate, 1));
    }
  }
}
