import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'isSelectedDay',
  pure: true,
})
export class IsSelectedDayPipe implements PipeTransform {
  private lastDate: number | null = null;
  private lastSelectedDate: number | null = null;
  private lastResult: boolean = false;

  transform(date: Date, selectedDate: Date): boolean {
    if (!date || !selectedDate) return false;

    const dateTime = date.getTime();
    const selectedDateTime = selectedDate.getTime();

    if (
      this.lastDate === dateTime &&
      this.lastSelectedDate === selectedDateTime
    ) {
      return this.lastResult;
    }

    const normalizedDate = new Date(
      date.getFullYear(),
      date.getMonth(),
      date.getDate()
    ).getTime();
    const normalizedSelectedDate = new Date(
      selectedDate.getFullYear(),
      selectedDate.getMonth(),
      selectedDate.getDate()
    ).getTime();

    this.lastDate = dateTime;
    this.lastSelectedDate = selectedDateTime;
    this.lastResult = normalizedDate === normalizedSelectedDate;

    return this.lastResult;
  }
}
