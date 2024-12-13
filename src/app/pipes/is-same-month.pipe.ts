import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'isSameMonth',
  pure: true,
})
export class IsSameMonthPipe implements PipeTransform {
  transform(date: Date, viewDate: Date): boolean {
    if (!date || !viewDate) return false;

    return (
      date.getMonth() === viewDate.getMonth() &&
      date.getFullYear() === viewDate.getFullYear()
    );
  }
}
