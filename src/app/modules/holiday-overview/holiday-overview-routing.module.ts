import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { HolidayOverviewComponent } from './components/holiday-overview.component';

const routes: Routes = [
  {
    path: '',
    component: HolidayOverviewComponent
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class HolidayOverviewRoutingModule { }
