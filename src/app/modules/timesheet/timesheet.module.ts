import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { TimesheetRoutingModule } from './timesheet-routing.module';
import { TimesheetOverviewComponent } from './components/timesheet-overview-table/timesheet-overview.component';
import { SharedModule } from '../shared/shared.module';
import { ActiveConsultantsComponent } from './components/active-consultants/active-consultants.component';
import { TimesheetEntriesComponent } from './components/timesheet-entries/timesheet-entries.component';
import { TimesheetsComponent } from './components/timesheets/timesheets.component';
import { ViewTimesheetComponent } from './components/view-timesheet/view-timesheet.component';
import { TimesheetLabelsComponent } from './components/timesheet-labels/timesheet-labels.component';

import { TimesheetGenerationResultDialogComponent } from './components/timesheet-generation-result-dialog/timesheet-generation-result-dialog.component';
import { SendEmailDialogComponent } from './components/send-email-dialog/send-email-dialog.component';
import { EmailPreviewDialogComponent } from './components/email-preview-dialog/email-preview-dialog.component';
import { CommentComponent } from './components/comment/comment.component';
import { TimesheetRegenerationResultDialogComponent } from './components/timesheet-regeneration-result-dialog/timesheet-regeneration-result-dialog.component';
import { UnmatchedImportsComponent } from './components/unmatched-imports/unmatched-imports.component';
import { ViewUnmatchedImportComponent } from './components/view-unmatched-import/view-unmatched-import.component';
import { CheckUnmatchedImportsComponent } from './components/check-unmatched-imports/check-unmatched-imports.component';

@NgModule({
  declarations: [
    TimesheetOverviewComponent,
    ActiveConsultantsComponent,
    TimesheetEntriesComponent,
    TimesheetsComponent,
    ViewTimesheetComponent,
    TimesheetLabelsComponent,
    TimesheetGenerationResultDialogComponent,
    SendEmailDialogComponent,
    EmailPreviewDialogComponent,
    CommentComponent,
    TimesheetRegenerationResultDialogComponent,
    UnmatchedImportsComponent,
    ViewUnmatchedImportComponent,
    CheckUnmatchedImportsComponent,
  ],
  imports: [
    CommonModule,
    TimesheetRoutingModule,
    SharedModule
  ]
})
export class TimesheetModule { }
