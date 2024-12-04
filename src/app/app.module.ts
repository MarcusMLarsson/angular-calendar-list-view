import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { DemoComponent } from './demo/demo.component';
import { ListComponent } from './list/list.component';
import { DatePickerComponent } from './date-picker/date-picker.component';
import { DatePipe } from '@angular/common';
import { IsSelectedDayPipe } from './pipes/is-selected-day/is-selected-day.pipe';
import { WeekNumberPipe } from './pipes/week-number/week-number.pipe';

@NgModule({
  declarations: [
    AppComponent,
    DemoComponent,
    ListComponent,
    DatePickerComponent,
    IsSelectedDayPipe,
    WeekNumberPipe,
  ],
  imports: [BrowserModule, AppRoutingModule],
  providers: [DatePipe],
  bootstrap: [AppComponent],
})
export class AppModule {}
