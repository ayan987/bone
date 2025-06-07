import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { TimesheetTemplatesRoutingModule } from './timesheet-templates-routing.module';
import { SharedModule } from '../shared/shared.module';
import { CreateTemplateDialogComponent } from './components/create-template-dialog/create-template-dialog.component';


@NgModule({
  declarations: [
    CreateTemplateDialogComponent
  ],
  imports: [
    CommonModule,
    TimesheetTemplatesRoutingModule,
    SharedModule
  ]
})
export class TimesheetTemplatesModule { }
