import { Component, OnInit } from '@angular/core';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { ToastrService } from 'ngx-toastr';
import { ConsultantStatus } from '../../../../models/consultants-status-enum';
import { CreateConsultantsComponent } from '../create-consultants/create-consultants.component';
import { ConsultantService } from '../../../shared/services/consultant/consultant.service';
import { ConfirmModalComponent } from '../../../shared/modals/confirm-modal/confirm-modal.component';
import { Messages } from '../../../../models/message-enum';
import { PoService } from '../../../shared/services/po/po.service';
import { HttpErrorResponse } from '@angular/common/http';
import { DeleteModalComponent } from '../../../shared/modals/delete-modal/delete-modal.component';
import { Modules } from '../../../../models/modules-enum';
import { Util } from '../../../../libraries/Util';

@Component({
  selector: 'app-consultants-list',
  templateUrl: './consultants-list.component.html',
  styleUrl: './consultants-list.component.scss'
})
export class ConsultantsListComponent implements OnInit {
  displayedColumns: string[] = ['name', 'email', 'clientEmail', 'status', 'action'];
  dataSource: any = [];
  isLoading!: boolean;
  Active = ConsultantStatus.Active;
  Inactive = ConsultantStatus.Inactive;

  constructor(
    public dialog: MatDialog,
    public toastr: ToastrService,
    private consultantService: ConsultantService,
    private poService: PoService,
    public dialogRefConfirm: MatDialogRef<DeleteModalComponent>,
  ) {}

  ngOnInit(): void {
    this.getAllConsultantList();
  }

  getAllConsultantList(): void {
    this.isLoading = true;
    this.consultantService.getAllConsultants()?.subscribe({
      next: (response: any) => {
        if (response.status === 200) {
          this.dataSource = response?.body;
          this.isLoading = false;
        }
      },
      error: (err: any) => {
        this.isLoading = false;
        console.log(err);
      },
    });
  }

  createConsultants(): void {
    let dialogRef = this.dialog.open(CreateConsultantsComponent, {
      panelClass: 'create-modal',
      width: '700px',
      height: '510px',
      disableClose: true,
    });
    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.getAllConsultantList();
      }
    });
  }

  editConsultant(id: string): void{
    this.getConsultantById(id);
  }

  getConsultantById(id: string): void {
    this.consultantService.getConsultantById(id).subscribe({
      next: (response: any) => {
        if (response.status === 200) {
          let dialogRef = this.dialog.open(CreateConsultantsComponent, {
            panelClass: 'create-modal',
            width: '700px',
            height: '510px',
            disableClose: true,
            data: response.body,
          });
          dialogRef.afterClosed().subscribe((result) => {
            if (result) {
              this.getAllConsultantList();
            }
          });
        }
      },
      error: (err: any) => {
        console.log(err);
      },
    });
  }

  deleteConsultant(consultantData: any, id: string): void {
    const consultantName = consultantData.firstName + ' ' + consultantData.lastName;
    this.poService.checkConsultantDelete(id).subscribe({
      next: (response: any) => {
        if (response){
          let dialogRef = this.dialog.open(DeleteModalComponent, {
            panelClass: 'edit-modal',
            width: '590px',
            height: '270px',
            disableClose: true,
            data: Util.showModalMessages(Modules.Consultant, consultantName, Messages.deleteConsultantMessage)
          });
          dialogRef.afterClosed().subscribe((result) => {
            if (result) {
              this.dialogRefConfirm.close();
            }
          });
        } else {
          this.deleteConsultantById(id);
        }
      },
      error: (err: HttpErrorResponse) => {
        console.log(err);
      },
    });
  }

  deleteConsultantById(id: string): void {
    let dialogRef = this.dialog.open(ConfirmModalComponent, {
      panelClass: 'delete-modal',
      width: '445px',
      height: '220px',
      disableClose: true,
      data: [Messages.deleteConsultant, Messages.deleteConsultantTitle],
    });
    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.consultantService.deleteConsultant(id).subscribe({
          next: (response: any) => {
            if(response.status === 200) {
              this.toastr.success('Consultant deleted successfully');
              this.getAllConsultantList();
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
