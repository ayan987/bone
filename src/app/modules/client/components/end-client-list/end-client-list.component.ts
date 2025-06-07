import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { ToastrService } from 'ngx-toastr';
import { Util } from '../../../../libraries/Util';
import { Messages } from '../../../../models/message-enum';
import { Modules } from '../../../../models/modules-enum';
import { clientStatus } from '../../../../models/status-enum';
import { ConfirmModalComponent } from '../../../shared/modals/confirm-modal/confirm-modal.component';
import { DeleteModalComponent } from '../../../shared/modals/delete-modal/delete-modal.component';
import { ClientProjectService } from '../../../shared/services/client-project/client-project.service';
import { ClientsService } from '../../services/client/clients.service';
import { CreateClientsComponent } from '../create-clients/create-clients.component';
import { DialogCreateEndClientComponent } from '../dialog-create-end-client/dialog-create-end-client.component';
import { EndClient } from '../../../../models/endClient';
import { EndclientService } from '../../../shared/services/end-client/endclient.service';

@Component({
  selector: 'app-end-client-list',
  templateUrl: './end-client-list.component.html',
  styleUrl: './end-client-list.component.scss'
})
export class EndClientListComponent implements OnInit {
  displayedColumns = ['name', 'responsiblePersons', 'action'];
  dataSource: EndClient[] = [];
  isLoading!: boolean;
  Active = clientStatus.Active;
  Inactive = clientStatus.Inactive;

  constructor(
    public dialog: MatDialog,
    public toastr: ToastrService,
    public clientService: ClientsService,
    public endClientService: EndclientService,
    private clientProjectService: ClientProjectService,
    public dialogRefConfirm: MatDialogRef<DeleteModalComponent>,
  ) {}

  ngOnInit(): void {
    this.getAllEndClients();
  }

  //Method to get all clients
  getAllEndClients(): void {
    this.isLoading = true;
    this.endClientService.getAllEndClients().subscribe({
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

  editEndClient(row: EndClient): void {
    const ref = this.dialog.open(DialogCreateEndClientComponent, {
      panelClass: 'create-modal',
      width: '1000px',
      data: row
    });
    ref.afterClosed().subscribe(res => { if (res) this.getAllEndClients(); });
  }

  //Method to get client by id
  // getEndClientById(id: string): void {
  //   this.clientService.getClientById(id).subscribe({
  //     next: (response: any) => {
  //       if (response.status === 200) {
  //         let dialogRef = this.dialog.open(CreateClientsComponent, {
  //           panelClass: 'create-modal',
  //           width: '500px',
  //           height: '500px',
  //           disableClose: true,
  //           data: response.body
  //         });
  //         dialogRef.afterClosed().subscribe((result) => {
  //           if (result) {
  //             this.getAllEndClients();
  //           }
  //         });
  //       }
  //     },
  //     error: (err: any) => {
  //       console.log(err);
  //     },
  //   });
  // }

  openEndClientDialog() {
    const dialogRef = this.dialog.open(DialogCreateEndClientComponent, {
      panelClass: 'create-modal',
      width: '1000px',
      // height: '1000px',
      disableClose: true,
    });
  
    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.getAllEndClients();
      }
    });
  }

  //Method to edit client
  // editEndClient(id: string): void {
  //   this.getEndClientById(id);
  // }

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
        this.clientService.deleteClient(clientId).subscribe({
          next: (response: any) => {
            if(response.status === 200) {
              this.toastr.success('Client deleted successfully');
              this.getAllEndClients();
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

