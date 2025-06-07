import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { TimesheetsComponent } from './components/timesheets/timesheets.component';
import { TimesheetEntriesComponent } from './components/timesheet-entries/timesheet-entries.component';
import { ActiveConsultantsComponent } from './components/active-consultants/active-consultants.component';

const routes: Routes = [
  {
    path: '',
    component: TimesheetsComponent
  },
  {
    path: 'view-timesheets',
    component: TimesheetEntriesComponent
  },
  {
    path: 'active-consultants',
    component: ActiveConsultantsComponent
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class TimesheetRoutingModule { }
