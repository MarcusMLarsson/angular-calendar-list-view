import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class StateService {
  /**
   * Represents the date selected by the user in the day picker.
   */
  private dayPickerSelectedDate = new BehaviorSubject<Date>(new Date());
  dayPickerSelectedDate$ = this.dayPickerSelectedDate.asObservable();

  /**
   * Represents the date currently visible in the list view (scrolled to).
   */
  private listViewScrolledDate = new BehaviorSubject<Date>(new Date());
  listViewScrolledDate$ = this.listViewScrolledDate.asObservable();

  /**
   * Updates the selected date in the day picker.
   * @param date The new selected date.
   */
  setDayPickerSelectedDate(date: Date): void {
    this.dayPickerSelectedDate.next(date);
  }

  /**
   * Updates the date based on the current scroll position in the list view.
   * @param date The date currently visible in the list view.
   */
  setListViewScrolledDate(date: Date): void {
    this.listViewScrolledDate.next(date);
  }
}
