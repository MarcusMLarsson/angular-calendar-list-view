import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { SmartComponent } from './smart/smart.component';

const routes: Routes = [{ path: '', component: SmartComponent }];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule {}
