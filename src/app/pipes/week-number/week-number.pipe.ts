import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'weekNumber',
})
export class WeekNumberPipe implements PipeTransform {
  transform(value: Date): string {
    const startDate = new Date(value.getFullYear(), 0, 1);
    const days = Math.floor(
      (value.getTime() - startDate.getTime()) / (24 * 60 * 60 * 1000)
    );
    const weekNumber = Math.ceil((days + 1) / 7);

    return `W${weekNumber}`;
  }
}
