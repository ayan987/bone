import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { ConsultantsRoutingModule } from './consultants-routing.module';
import { SharedModule } from '../shared/shared.module';
import { ConsultantsListComponent } from './components/consultants-list/consultants-list.component';
import { CreateConsultantsComponent } from './components/create-consultants/create-consultants.component';


@NgModule({
  declarations: [
    ConsultantsListComponent,
    CreateConsultantsComponent
  ],
  imports: [
    CommonModule,
    ConsultantsRoutingModule,
    SharedModule
  ]
})
export class ConsultantsModule { }
