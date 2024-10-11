import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CalendarCommonModule } from '../common/calendar-common.module';
import { CalendarListViewComponent } from './calendar-list-view/calendar-list-view.component';

@NgModule({
  imports: [CommonModule, CalendarCommonModule],
  declarations: [CalendarListViewComponent],
  exports: [CalendarListViewComponent],
})
export class CalendarListModule {}
