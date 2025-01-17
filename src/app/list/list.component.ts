import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CalendarEvent } from '../utils/utils';

@Component({
  selector: 'app-list',
  templateUrl: './list.component.html',
  styleUrls: ['./list.component.scss'],
})
export class ListComponent {
  /**
   * The current view date
   */
  @Input() viewDate!: Date;

  /**
   * An array of events to display on view
   * The schema is available here: https://github.com/mattlewis92/calendar-utils/blob/c51689985f59a271940e30bc4e2c4e1fee3fcb5c/src/calendarUtils.ts#L49-L63
   */
  @Input() events: CalendarEvent[] = [];

  /**
   *  Emits the event when clicking on an event in the list view
   *  For example, you can use this event to open a dialog with event details.
   */
  @Output() eventClicked = new EventEmitter<{
    event: CalendarEvent;
    sourceEvent: MouseEvent | KeyboardEvent;
  }>();

  @Input() groupedEventsByDate!: {
    dateLabel: Date;
    events: CalendarEvent[];
  }[];

  // Emits the event when clicking on an event in the list view
  onEventClick(
    event: CalendarEvent,
    sourceEvent: MouseEvent | KeyboardEvent
  ): void {
    // TODO: Implement functionality to open a dialog with event details.
    this.eventClicked.emit({ event, sourceEvent });
  }
}
