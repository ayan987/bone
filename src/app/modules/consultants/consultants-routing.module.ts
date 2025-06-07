import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ConsultantsListComponent } from './components/consultants-list/consultants-list.component';

const routes: Routes = [
  {
    path: '',
    component: ConsultantsListComponent
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ConsultantsRoutingModule { }
