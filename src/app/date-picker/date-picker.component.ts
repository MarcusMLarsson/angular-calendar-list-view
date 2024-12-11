import { Component, Input, Output, EventEmitter } from '@angular/core';
import { DatePipe } from '@angular/common';
import { StateService } from '../service/state.service';

@Component({
  selector: 'app-date-picker',
  templateUrl: './date-picker.component.html',
  styleUrls: ['./date-picker.component.scss'],
})
export class DatePickerComponent {
  @Input() dayAbbreviations!: string[];
  @Input() monthDays!: Array<Array<{ date: Date; dayNumber: number }>>;
  @Input() dayPickerSelectedDate!: Date;
  @Input() viewDate: Date = new Date();

  @Input() currentWeek!: Array<{ date: Date; dayNumber: number }>;
  @Output() changeStep = new EventEmitter<{
    step: 'next' | 'previous';
    isExpanded: boolean;
  }>();

  isExpanded: boolean = false;

  constructor(
    public datePipe: DatePipe,
    private calendarListStateService: StateService
  ) {}

  /*
   * Expands or contract the day picker  *
   */
  toggleView() {
    this.isExpanded = !this.isExpanded;
  }

  /*
   * Returns the day abbreviation for the given date *
   */
  getDayAbbreviation(date: Date): string {
    return this.datePipe.transform(date, 'EEE') || '';
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

  goToPreviousStep(isExpanded: boolean): void {
    this.changeStep.emit({ step: 'previous', isExpanded });
  }

  goToNextStep(isExpanded: boolean): void {
    this.changeStep.emit({ step: 'next', isExpanded });
  }
}
