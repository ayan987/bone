import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HolidayOverviewComponent } from './components/holiday-overview.component';
import { HolidayOverviewRoutingModule } from './holiday-overview-routing.module';
import { SharedModule } from '../shared/shared.module';



@NgModule({
  declarations: [
    HolidayOverviewComponent
  ],
  imports: [
    CommonModule,
    HolidayOverviewRoutingModule,
    SharedModule
  ]
})
export class HolidayOverviewModule { }
