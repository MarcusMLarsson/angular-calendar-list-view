import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'isSelectedDay',
  pure: true,
})
export class IsSelectedDayPipe implements PipeTransform {
  transform(date: Date, selectedDate: Date): boolean {
    console.log('HELLO');
    return (
      selectedDate &&
      date.getDate() === selectedDate.getDate() &&
      date.getMonth() === selectedDate.getMonth() &&
      date.getFullYear() === selectedDate.getFullYear()
    );
  }
}
