import { Injectable } from '@angular/core';
import { WeekStart } from '../utils/utils';

@Injectable({
  providedIn: 'root',
})
export class ConfigService {
  private weekStartOn: WeekStart = WeekStart.Monday; // Default to Sunday

  constructor() {}

  // Getter for weekStartOn
  getWeekStartOn(): WeekStart {
    return this.weekStartOn;
  }

  // Setter for weekStartOn
  setWeekStartOn(value: WeekStart): void {
    this.weekStartOn = value;
  }
}
