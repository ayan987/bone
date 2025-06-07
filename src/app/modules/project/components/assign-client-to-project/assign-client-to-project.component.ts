import { Component, Inject, OnInit, Optional } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import {
  MAT_DIALOG_DATA,
  MatDialog,
  MatDialogRef,
} from '@angular/material/dialog';
import { ProjectStatus } from '../../../../models/project-status.enum';
import { ClientProjectService } from '../../../shared/services/client-project/client-project.service';
import { HttpErrorResponse } from '@angular/common/http';
import { ConfirmModalComponent } from '../../../shared/modals/confirm-modal/confirm-modal.component';
import { Messages } from '../../../../models/message-enum';
import { ToastrService } from 'ngx-toastr';
import { AssignStatusEnum } from '../../../../models/assign-status-enum';
import { Util } from '../../../../libraries/Util';
import { Modules } from '../../../../models/modules-enum';
import { DeleteModalComponent } from '../../../shared/modals/delete-modal/delete-modal.component';

export interface ProjectData {
  id: string;
  projectName: string;
  status: string;
  clients: any;
  endClients: any;
}

export interface Client {
  id: string;
  shortName: string;
  legalName: string;
  status: string;
}

export interface Assignclientproject {
  id: string;
  clientId: string;
  projectId: string;
  status: string;
}

@Component({
  selector: 'app-assign-client-to-project',
  templateUrl: './assign-client-to-project.component.html',
  styleUrl: './assign-client-to-project.component.scss',
})
export class AssignClientToProjectComponent implements OnInit {
  draft = ProjectStatus.draft;
  active = ProjectStatus.active;
  assignedClients: any = [];
  filteredClients: any = [];
  isAssigning = false;
  clientFields = ['id', 'shortName', 'legalName', 'status'];
  showClientForm = false;
  isAssignedOrRemoved = false;

  clientForm = this.fb.group({
    client: [{}, Validators.required]
  });

  constructor(
    public dialogRef: MatDialogRef<AssignClientToProjectComponent>,
    private fb: FormBuilder,
    private clientProjectService: ClientProjectService,
    @Optional() @Inject(MAT_DIALOG_DATA) public projectDetails: ProjectData,
    private dialog: MatDialog,
    public toastr: ToastrService
  ) {
    this.dialogRef.disableClose = true;
  }

  ngOnInit(): void {
    if (!this.projectDetails) {
      this.projectDetails = {
        id: '',
        projectName: '',
        status: this.draft,
        clients: [],
        endClients: {}
      };
    }
    this.getAllClientList();
  }

  getAllClientList(): void {
    this.isAssigning = true;
    this.clientProjectService.getAllClients().subscribe({
      next: (response: any) => {
        if (response.status === 200) {
          const clientList: any[] = response.body.filter((client: any) => client.status === AssignStatusEnum.active);
          this.assignedClients = this.projectDetails.clients
          .filter((client: Client) => client.status === AssignStatusEnum.active);
          this.assignedClients = this.assignedClients.map((assignedClient: any) => {
            const client = clientList.find((client: Client) => client.id === assignedClient.clientId);
            return {
            ...assignedClient,
            clientShortName: client ? client.shortName : 'Unknown Client'
            };
          });
          this.filteredClients = clientList.filter((client: any) => !this.assignedClients.some((assignedClient: any) => assignedClient.clientId === client.id));
          this.isAssigning = false;
        }
      },
      error: (err: HttpErrorResponse) => {
        this.isAssigning = false;
        console.log('An error occured', err);
      },
    });
  }

  closeDialog(): void {
    this.dialogRef.close(this.isAssignedOrRemoved);
  }

  deleteClientProject(clientProject: any): void {
    this.clientProjectService.checkIsAbrufOrPOAssociatedWithProjectClient(clientProject.id).subscribe({
        next: (response: any) => {
          if (response.body){
            this.dialog.open(DeleteModalComponent, {
              panelClass: 'edit-modal',
              width: '590px',
              height: '270px',
              disableClose: true,
              data: Util.showModalMessages(Modules.ClientRemove, clientProject.clientShortName, Messages.removeClientProjectMessage)
            });
          } else {
            this.deleteCleintProjectById(clientProject);
          }
        },
        error: (err: HttpErrorResponse) => {
          console.log(err);
        },
    });
  }

  deleteCleintProjectById(clientProject: any): void {
    let dialogRef = this.dialog.open(ConfirmModalComponent, {
      panelClass: 'delete-modal',
      width: '445px',
      height: '220px',
      disableClose: true,
      data: [Messages.removeClientProjectWarning, Messages.removeClientProjectHeading]
    });
    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.isAssigning = true;
        this.clientProjectService.deleteCleintProjectById(clientProject.id).subscribe({
          next: (response: any) => {
            if(response.status === 200) {
              this.isAssignedOrRemoved = true;
              this.toastr.success('Client Removed from Project successfully');
              this.filteredClients.push({
                id: clientProject.clientId,
                shortName: clientProject.clientShortName,
                status: AssignStatusEnum.active
              });
              this.assignedClients = this.assignedClients.filter(
              (assignedClient: any) => assignedClient.id !== clientProject.id
              );
              this.isAssigning = false;
            }
          },
          error: (err: any) => {
            console.log(err);
            this.isAssigning = false;
          }
        });
      }
    });
  }

  compareClients(client1: any, client2: any): boolean {
    return client1 && client2 ? client2.id === client1.id : client2 === client1;
  }

  toggleClientFormArea() {
    this.showClientForm = !this.showClientForm;
  }

  saveClientProject(): void {
    if (this.projectDetails.status === ProjectStatus.draft){
      let dialogRef = this.dialog.open(ConfirmModalComponent, {
        panelClass: 'edit-modal',
        width: '445px',
        height: '220px',
        disableClose: true,
        data: [Messages.statusDraftToActive, Messages.projectStatusChangeModalText],
      });
      dialogRef.afterClosed().subscribe((result) => {
        if (result) {
          this.assignClientAndProject(ProjectStatus.active);
        } else if (!result){
          this.assignClientAndProject(ProjectStatus.draft);
        }
      });
    } else if (this.projectDetails.status === ProjectStatus.active){
      this.assignClientAndProject(ProjectStatus.active);
    }
  }

  assignClientAndProject(projectStatus: string): void {
    this.isAssigning = true;
    const client: any = this.clientForm.value.client;
    // Generating new json for the post call
    const assignClientProject = [{
      id: '',
      clientId: client?.id,
      status: AssignStatusEnum.active,
      projectId: this.projectDetails.id,
      // endClients: this.projectDetails.endClients
    }];

    this.clientProjectService.assignClientToProject(projectStatus, assignClientProject).subscribe({
      next: (response: any) => {
        if (response.status === 200) {
          this.isAssignedOrRemoved = true;
          this.toastr.success('Client assigned successfully');
            this.assignedClients.push({
            ...assignClientProject[0],
            id: response.body.info.records.projectClientAbrufs[0].id,
            clientShortName: client.shortName
            });
            this.filteredClients = this.filteredClients.filter((filteredClient: any) => filteredClient.id !== client.id);
            this.clientForm.reset();
            this.showClientForm = !this.showClientForm;
            this.isAssigning = false;
        }
      },
      error: (err: HttpErrorResponse) => {
        this.isAssigning = false;
        console.log('An error occured', err);
        if(err.status === 404){
          this.toastr.error('Client Already Assigned to Project');
        }
      },
    });
  }
}
