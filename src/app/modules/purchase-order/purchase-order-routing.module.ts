import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ViewPoComponent } from './components/view-po/view-po.component';

const routes: Routes = [
  { path: 'po-details/:id', component: ViewPoComponent },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class PurchaseOrderRoutingModule { }
