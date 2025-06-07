import { Component, OnInit } from '@angular/core';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { CreateClientsComponent } from '../create-clients/create-clients.component';
import { ToastrService } from 'ngx-toastr';
import { ClientsService } from '../../services/client/clients.service';
import { clientStatus } from '../../../../models/status-enum';
import { HttpErrorResponse } from '@angular/common/http';
import { Messages } from '../../../../models/message-enum';
import { ConfirmModalComponent } from '../../../shared/modals/confirm-modal/confirm-modal.component';
import { DeleteModalComponent } from '../../../shared/modals/delete-modal/delete-modal.component';
import { ClientProjectService } from '../../../shared/services/client-project/client-project.service';
import { Modules } from '../../../../models/modules-enum';
import { Util } from '../../../../libraries/Util';

@Component({
  selector: 'app-client-list',
  templateUrl: './client-list.component.html',
  styleUrl: './client-list.component.scss',
})
export class ClientListComponent implements OnInit {
  displayedColumns: string[] = ['shortName', 'legalName', 'contactPerson', 'status', 'action'];
  dataSource: any = [];
  isLoading!: boolean;
  Active = clientStatus.Active;
  Inactive = clientStatus.Inactive;

  constructor(
    public dialog: MatDialog,
    public toastr: ToastrService,
    public client: ClientsService,
    private clientProjectService: ClientProjectService,
    public dialogRefConfirm: MatDialogRef<DeleteModalComponent>,
  ) {}

  ngOnInit(): void {
    this.getAllClientList();
  }

  //Method to get all clients
  getAllClientList(): void {
    this.isLoading = true;
    this.client.getAllClients().subscribe({
      next: (response: any) => {
        if (response.status === 200) {
          this.dataSource = response.body;
          this.isLoading = false;
        }
      },
      error: (err) => {
        this.isLoading = false;
        console.log(err);
      },
    });
  }

  //Method to get client by id
  getClientById(id: string): void {
    this.client.getClientById(id).subscribe({
      next: (response: any) => {
        if (response.status === 200) {
          let dialogRef = this.dialog.open(CreateClientsComponent, {
            panelClass: 'create-modal',
            width: '1000px',
            height: '700px',
            disableClose: true,
            data: response.body
          });
          dialogRef.afterClosed().subscribe((result) => {
            if (result) {
              this.getAllClientList();
            }
          });
        }
      },
      error: (err: any) => {
        console.log(err);
      },
    });
  }

  //Method to create client
  createClients(): void {
    let dialogRef = this.dialog.open(CreateClientsComponent, {
      panelClass: 'create-modal',
      width: '1000px',
      height: '700px',
      disableClose: true,
    });
    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.getAllClientList();
      }
    });
  }

  //Method to edit client
  editClient(id: string): void {
    this.getClientById(id);
  }

  deleteClient(clientId: string, clientData: any): void {
    const clientName = clientData.shortName;
    this.clientProjectService.checkClientIsAssociatedWithProject(clientId).subscribe({
      next: (response: any) => {
        if (response.body === true){
          let dialogRef = this.dialog.open(DeleteModalComponent, {
            panelClass: 'edit-modal',
            width: '590px',
            height: '270px',
            disableClose: true,
            data: Util.showModalMessages(Modules.Client, clientName, Messages.deleteClientMessages)
          });
          dialogRef.afterClosed().subscribe((result) => {
            if (result) {
              this.dialogRefConfirm.close();
            }
          });
        } else {
          this.deleteClientById(clientId);
        }
      },
      error: (err: HttpErrorResponse) => {
        console.log(err);
      },
    });
  }

  deleteClientById(clientId: string): void {
    let dialogRef = this.dialog.open(ConfirmModalComponent, {
      panelClass: 'delete-modal',
      width: '445px',
      height: '220px',
      disableClose: true,
      data: [Messages.deleteClientMessagePopUp, Messages.deleteClient],
    });
    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.client.deleteClient(clientId).subscribe({
          next: (response: any) => {
            if(response.status === 200) {
              this.toastr.success('Client deleted successfully');
              this.getAllClientList();
            }
          },
          error: (err: any) => {
            console.log(err);
          }
        });
      }
    });
  }
}
