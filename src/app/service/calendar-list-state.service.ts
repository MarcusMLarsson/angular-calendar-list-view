import { Injectable } from '@angular/core';
import { BehaviorSubject, Subject } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class CalendarListStateService {
  /**
   * Represents the date selected by the user in the day picker.
   */
  private dayPickerSelectedDate = new Subject<Date>();
  dayPickerSelectedDate$ = this.dayPickerSelectedDate.asObservable();

  /**
   * Updates the selected date in the day picker.
   * @param date The new selected date.
   */
  setDayPickerSelectedDate(date: Date): void {
    this.dayPickerSelectedDate.next(date);
  }

  /**
   * Represents the date currently visible at the top of the list view
   */
  private listViewTopDate = new BehaviorSubject<Date>(new Date());
  listViewTopDate$ = this.listViewTopDate.asObservable();

  /**
   * Updates the date based on the current scroll position in the list view.
   * @param date The date currently visible in the list view.
   */
  setListViewTopDate(date: Date): void {
    this.listViewTopDate.next(date);
  }
}
