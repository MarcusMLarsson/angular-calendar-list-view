import { Component, Input, Output, EventEmitter } from '@angular/core';
import { DatePipe } from '@angular/common';
import { StateService } from '../service/state.service';

@Component({
  selector: 'app-date-picker',
  templateUrl: './date-picker.component.html',
  styleUrls: ['./date-picker.component.scss'],
})
export class DatePickerComponent {
  @Input() dayOfWeekAbbreviations!: string[];
  @Input() currentMonthDays!: Array<Array<{ date: Date; dayNumber: number }>>;
  @Input() viewDate: Date = new Date();

  @Input() currentWeekDays!: Array<{ date: Date; dayNumber: number }>;
  @Output() changeStep = new EventEmitter<{
    step: 'next' | 'previous';
    dayPickerViewMode: 'week' | 'month';
  }>();

  @Output() viewModeChange = new EventEmitter<'week' | 'month'>();

  dayPickerViewMode: 'week' | 'month' = 'week';

  constructor(
    public datePipe: DatePipe,
    private calendarListStateService: StateService
  ) {}

  /*
   * Expands or contract the day picker  *
   */
  toggleView() {
    this.dayPickerViewMode =
      this.dayPickerViewMode === 'week' ? 'month' : 'week';

    this.viewModeChange.emit(this.dayPickerViewMode);
  }

  /*
   * Returns true if the given date is in the same month as the view date *
   * Used to highlight the selected date in blue *
   */
  isSameMonth(date: Date): boolean {
    return date.getMonth() === this.viewDate.getMonth();
  }

  /*
   * Called when a date is clicked *
   * Sets the selected date to the clicked date *
   */
  onDateClick(date: Date): void {
    this.calendarListStateService.setDayPickerSelectedDate(date);
  }

  goToPreviousStep(dayPickerViewMode: 'week' | 'month'): void {
    this.changeStep.emit({ step: 'previous', dayPickerViewMode });
  }

  goToNextStep(dayPickerViewMode: 'week' | 'month'): void {
    this.changeStep.emit({ step: 'next', dayPickerViewMode });
  }
}
