import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { CalendarComponent } from './calendar/calendar.component';
import { ListComponent } from './list/list.component';
import { DatePickerComponent } from './date-picker/date-picker.component';
import { DatePipe } from '@angular/common';
import { IsSelectedDayPipe } from './pipes/is-selected-day/is-selected-day.pipe';
import { MatIconModule } from '@angular/material/icon';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { ScrollingModule } from '@angular/cdk/scrolling';
import { IsSameMonthPipe } from './pipes/is-same-month/is-same-month.pipe';
import { SvgIconComponent } from './svg-icon/svg-icon.component';
import { HttpClientModule } from '@angular/common/http';
import { BookingIndicatorsComponent } from './date-picker/booking-indicator.component';

@NgModule({
  declarations: [
    AppComponent,
    CalendarComponent,
    ListComponent,
    DatePickerComponent,
    BookingIndicatorsComponent,
    SvgIconComponent,
    IsSelectedDayPipe,
    IsSameMonthPipe,
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    MatIconModule,
    BrowserAnimationsModule,
    ScrollingModule,
    HttpClientModule,
  ],
  providers: [DatePipe],
  bootstrap: [AppComponent],
})
export class AppModule {}
