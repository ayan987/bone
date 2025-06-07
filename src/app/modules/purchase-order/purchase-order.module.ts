import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { PurchaseOrderRoutingModule } from './purchase-order-routing.module';
import { ViewPoComponent } from './components/view-po/view-po.component';
import { SharedModule } from '../shared/shared.module';
import { AssignConsultantComponent } from './components/assign-consultant/assign-consultant.component';
import { TimesheetConsultantComponent } from './components/timesheet-consultant/timesheet-consultant.component';
import { AddTimesheetEntryComponent } from './components/add-timesheet-entry/add-timesheet-entry.component';


@NgModule({
  declarations: [ViewPoComponent, AssignConsultantComponent, TimesheetConsultantComponent, AddTimesheetEntryComponent],
  imports: [
    CommonModule,
    PurchaseOrderRoutingModule,
    SharedModule
  ]
})
export class PurchaseOrderModule { }
