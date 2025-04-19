import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CalendarEvent, CalendarBooking, BookingStatus } from '../utils/utils';

export const colors = {
  yellow: {
    primary: '#e3bc08',
    secondary: '#FDF1BA',
  },
  gray: {
    primary: '#e0e0e0',
    secondary: '#f9f9f9',
  },
};

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
   *  Emits the event when clicking on an event in the list view
   *  For example, you can use this event to open a dialog with event details.
   */
  @Output() bookingClicked = new EventEmitter<CalendarBooking>();

  @Output() noEventsClicked = new EventEmitter<Date>();

  @Input() groupedEventsByDate!: {
    dateLabel: Date;
    events: CalendarEvent[];
  }[];

  onEventClick(booking: CalendarBooking): void {
    this.bookingClicked.emit(booking);
  }

  onNoEventsClick(dateLabel: string): void {
    const date = new Date(dateLabel);
    this.noEventsClicked.emit(date);
  }

  colors = colors;
  bookingStatus = BookingStatus;
}
