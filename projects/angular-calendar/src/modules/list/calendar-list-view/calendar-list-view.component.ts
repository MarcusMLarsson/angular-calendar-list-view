import { Component, Input } from '@angular/core';
import { CalendarEvent } from 'calendar-utils';

@Component({
  selector: 'mwl-calendar-list-view',
  template: `{{ events | json }} `,
})
export class CalendarListViewComponent {
  /**
   * The current view date
   */
  @Input() viewDate: Date;

  /**
   * An array of events to display on view
   * The schema is available here: https://github.com/mattlewis92/calendar-utils/blob/c51689985f59a271940e30bc4e2c4e1fee3fcb5c/src/calendarUtils.ts#L49-L63
   */
  @Input() events: CalendarEvent[] = [];
}
