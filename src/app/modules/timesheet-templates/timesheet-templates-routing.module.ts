import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { TemplateOverviewComponent } from './components/template-overview/template-overview.component';

const routes: Routes = [
  {
    path: '',
    component: TemplateOverviewComponent
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class TimesheetTemplatesRoutingModule { }
