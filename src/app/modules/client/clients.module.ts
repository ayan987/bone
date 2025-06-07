import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SharedModule } from '../shared/shared.module';
import { ClientsRoutingModule } from './clients-routing.module';
import { CreateClientsComponent } from './components/create-clients/create-clients.component';
import { ClientListComponent } from './components/client-list/client-list.component';
import { ClientsComponent } from './components/clients/clients.component';
import { EndClientListComponent } from './components/end-client-list/end-client-list.component';
import { DialogCreateEndClientComponent } from './components/dialog-create-end-client/dialog-create-end-client.component';



@NgModule({
  declarations: [
    ClientListComponent,
    CreateClientsComponent,
    ClientsComponent,
    EndClientListComponent,
    DialogCreateEndClientComponent,
  ],
  imports: [
    CommonModule,
    ClientsRoutingModule,
    SharedModule
  ]
})
export class ClientsModule { }
