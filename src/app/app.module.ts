import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { DemoComponent } from './demo/demo.component';
import { ListComponent } from './list/list.component';
import { DatePickerComponent } from './date-picker/date-picker.component';
import { DatePipe, CommonModule } from '@angular/common';

@NgModule({
  declarations: [
    AppComponent,
    DemoComponent,
    ListComponent,
    DatePickerComponent,
  ],
  imports: [BrowserModule, AppRoutingModule, CommonModule],
  providers: [DatePipe],
  bootstrap: [AppComponent],
})
export class AppModule {}
