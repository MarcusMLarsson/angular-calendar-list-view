import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { SmartComponent } from './smart/smart.component';
import { ListComponent } from './list/list.component';
import { DatePickerComponent } from './date-picker/date-picker.component';
import { DatePipe } from '@angular/common';
import { IsSelectedDayPipe } from './pipes/is-selected-day/is-selected-day.pipe';
import { MatIconModule } from '@angular/material/icon';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { ScrollingModule } from '@angular/cdk/scrolling';
import { IsSameMonthPipe } from './pipes/is-same-month.pipe';

@NgModule({
  declarations: [
    AppComponent,
    SmartComponent,
    ListComponent,
    DatePickerComponent,
    IsSelectedDayPipe,
    IsSameMonthPipe,
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    MatIconModule,
    BrowserAnimationsModule,
    ScrollingModule,
  ],
  providers: [DatePipe],
  bootstrap: [AppComponent],
})
export class AppModule {}
