import { Component, Inject, OnInit, ViewChild } from '@angular/core';
import {
  FormBuilder,
  FormControl,
  Validators,
  FormArray,
} from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialog, MatDialogRef } from '@angular/material/dialog';
import { Util } from '../../../../libraries/Util';
import { ClientProjectService } from '../../../shared/services/client-project/client-project.service';
import { HttpErrorResponse, HttpResponse } from '@angular/common/http';
import { ReplaySubject, Subject, take, takeUntil } from 'rxjs';
import { MatSelect } from '@angular/material/select';
import { AbrufService } from '../../../shared/services/abruf/abruf.service';
import { CustomValidators } from '../../../../custom-validator';
import { ToastrService } from 'ngx-toastr';
import { ConfirmModalComponent } from '../../../shared/modals/confirm-modal/confirm-modal.component';
import { Messages } from '../../../../models/message-enum';
import { AssignStatusEnum } from '../../../../models/assign-status-enum';

@Component({
  selector: 'app-create-abruf',
  templateUrl: './create-abruf.component.html',
  styleUrl: './create-abruf.component.scss',
})
export class CreateAbrufComponent implements OnInit {
  protected projectClientAssign: any[] = [];

  isCreatingAbruf = false;

  public projectCtrl: FormControl = new FormControl('', [Validators.required]);
  public projectFilterCtrl: FormControl = new FormControl();
  public allProjectClients: any = new ReplaySubject(1);
  @ViewChild('singleSelect', { static: true }) singleSelect!: MatSelect;
  protected _onDestroy = new Subject();
  originalAbrufNo: any;

  createAbrufForm = this.fb.group(
    {
      id: [''],
      projectId: [''],
      clientId: [''],
      abrufs: this.fb.array([
        this.fb.group({
          id: [''],
          abrufName: [
            '',
            [
              // Validators.required,
              Validators.minLength(2),
              Validators.maxLength(150),
              Validators.pattern(/^(?!.*<[^>]*>)(?!.*<\/[^>]*>).*$/),
            ],
          ],
          abrufNo: [
            '',
            [
              Validators.required,
              Validators.minLength(10),
              Validators.maxLength(50),
              Validators.pattern(/^(?!.*<[^>]*>)(?!.*<\/[^>]*>).*$/),
            ],
          ],
          startDate: [''],
          endDate: [''],
          status: ['ACTIVE'],
        }),
      ]),
      status: ['ACTIVE'],
    },
    { validators: CustomValidators.dateExceedValidator('abrufs', 'startDate', 'endDate') }
  );

  clientProjectList: any = [];

  constructor(
    private fb: FormBuilder,
    public dialogRef: MatDialogRef<CreateAbrufComponent>,
    @Inject(MAT_DIALOG_DATA) public projectClientData: any,
    private ClientProjectService: ClientProjectService,
    private abrufService: AbrufService,
    private toastr: ToastrService,
    private dialog: MatDialog
  ) {}

  ngOnInit(): void {
    this.getClientProject();

    this.projectFilterCtrl.valueChanges
      .pipe(takeUntil(this._onDestroy))
      .subscribe(() => {
        this.filterClientProjects();
      });
    if(Array.isArray(this.projectClientData)){
      this.patchDataForEdit();
    }
  }

  patchDataForEdit(): void {
    if (this.projectClientData[1]?.abrufId) {
      this.createAbrufForm.patchValue({
        projectId: this.projectClientData[1].project.id,
        clientId: this.projectClientData[1].client.id,
        status: this.projectClientData[1].status,
      });

      // Clear existing FormArray
      this.abrufs.clear();
      // Wrap the single abruf object into an array
      const abrufDataArray = [this.projectClientData[1]]; // Wrap into an array
      // Loop through the array and create new FormGroup for each item
      abrufDataArray.forEach((abruf: any) => {
        const abrufGroup = this.fb.group({
          id: [abruf.abrufId],
          abrufName: [
            abruf.abrufName,
            [
              // Validators.required,
              Validators.minLength(2),
              Validators.maxLength(50),
              Validators.pattern(/^(?!.*<[^>]*>)(?!.*<\/[^>]*>).*$/),
            ],
          ],
          abrufNo: [
            abruf.abrufNo,
            [
              Validators.required,
              Validators.minLength(10),
              Validators.maxLength(50),
              Validators.pattern(/^(?!.*<[^>]*>)(?!.*<\/[^>]*>).*$/),
            ],
          ],
          startDate: [abruf.startDate],
          endDate: [abruf.endDate],
        });
        this.abrufs.push(abrufGroup);
      });

      this.originalAbrufNo = this.abrufs.value[0]?.abrufNo;

       // Find the corresponding object in allProjectClients
      this.allProjectClients.pipe(take(1)).subscribe((clients: any[]) => {
        const matchedClient = clients.find(client =>
          client.projectId === this.projectClientData[1].project.id &&
          client.clientId === this.projectClientData[1].client.id
        );
        // Patch the value to the projectCtrl if a match is found
        if (matchedClient) {
          this.projectCtrl.patchValue(matchedClient);
        }
      });
      this.projectCtrl.disable();
    }
  }

  get abrufs(): FormArray {
    return this.createAbrufForm.get('abrufs') as FormArray;
  }

  getClientProject(): void {
    this.ClientProjectService.getAssociatedClientProject().subscribe({
      next: (response: any) => {
        if (response.status === 200) {
          response.body = response.body.filter((item: any) => item.status === AssignStatusEnum.active);
          if(this.projectClientData){
            if(this.projectClientData?.abrufId || this.projectClientData[1]?.abrufId || this.projectClientData.projectId === undefined){
              this.projectClientAssign = response.body.filter(
                (item: any) => item.abrufRequired === true
              );
            } else {
              this.projectClientAssign = response.body.filter(
                // (item: any) => item.abrufRequired === true && item.projectId === (this.projectClientData || this.projectClientData[0])
                (item: any) => item.abrufRequired === true && item.projectId === (this.projectClientData.projectId || this.projectClientData[0])
              );
            }
          } else {
            this.projectClientAssign = response.body.filter(
              (item: any) => item.abrufRequired === true
            );
          }
          this.allProjectClients?.next(this.projectClientAssign.slice());
        }
      },
      error: (err: HttpErrorResponse) => {
        console.log('An error occurred:', err.message);
      },
    });
  }

  closeDialog(isCreated: boolean) {
    if (this.createAbrufForm.dirty || (this.projectCtrl.dirty || this.projectFilterCtrl.touched)) {
      let dialogRef = this.dialog.open(ConfirmModalComponent, {
        panelClass: 'edit-modal',
        width: '445px',
        height: '220px',
        disableClose: true,
        data: [Messages.closeConfirm, '']
      });
      dialogRef.afterClosed().subscribe((result) => {
        if (result) {
          this.dialogRef.close(true);
        }
      });
    } else {
      this.dialogRef.close(isCreated);
    }
  }

  saveAbruf(): void {
    this.isCreatingAbruf = true;
    if (Array.isArray(this.projectClientData) && this.projectClientData[1]?.abrufId){
      this.updateAbruf();
    } else {
      this.createAbruf();
    }
  }

  createAbruf(): void {
    this.createAbrufForm.get('id') ?.setValue(this.projectCtrl?.value.id);
    this.createAbrufForm.get('projectId') ?.setValue(this.projectCtrl?.value.projectId);
    this.createAbrufForm.get('clientId') ?.setValue(this.projectCtrl.value.clientId);
    const formValues = this.createAbrufForm.value;
    const formattedData = {
      ...formValues,
      abrufs: formValues.abrufs?.map((abruf: any) => {
        return {
          ...abruf,
          startDate: Util.dateString(abruf.startDate),
          endDate: Util.dateString(abruf.endDate)
        };
      }),
    };
    this.abrufService
      .createAbruf(this.projectCtrl?.value.id, formattedData)
      .subscribe({
        next: (response: HttpResponse<any>) => {
          if (response.status === 200) {
            this.isCreatingAbruf = false;
            this.dialogRef.close(true);
            this.toastr.success('Abruf added successfully');
          }
        },
        error: (err: HttpErrorResponse) => {
          this.isCreatingAbruf = false;
          if(err.status === 409) {
            this.toastr.error('Abruf No. already exists in the Project-Client Association!');
            this.createAbrufForm.get('abrufNo')?.setErrors({ 'duplicateAbrufNo': true });
          }
          console.log('An error occurred:', err.message);
        },
        complete: () => {
          this.isCreatingAbruf = false;
        }
      });
  }

  updateAbruf(): void {
    const updatedData = {
      id: this.abrufs.value[0].id,
      // abrufNo: this.originalAbrufNo === this.abrufs.value[0].abrufNo ? '' : this.abrufs.value[0].abrufNo,
      abrufNo: this.abrufs.value[0].abrufNo,
      abrufName: this.abrufs.value[0].abrufName,
      startDate: Util.dateString(this.abrufs.value[0].startDate),
      endDate: Util.dateString(this.abrufs.value[0].endDate),
      status: this.createAbrufForm.value.status,
    }

    this.abrufService
      .updateAbruf(this.projectClientData[0], updatedData)
      .subscribe({
        next: (response: HttpResponse<any>) => {
          if (response.status === 200) {
            this.dialogRef.close(true);
            this.toastr.success('Abruf updated successfully');
          }
        },
        error: (err: HttpErrorResponse) => {
          this.isCreatingAbruf = false;
          if(err.status === 409) {
            this.toastr.error('Abruf No. already exists in the Project-Client Association!');
            this.createAbrufForm.get('abrufNo')?.setErrors({ 'duplicateAbrufNo': true });
          }
          console.log('An error occurred:', err.message);
        },
      });
  }

  validateDate(): void {
    this.createAbrufForm.updateValueAndValidity();
  }

  /**
   * Methods to set the dropdown of the project client
   */

  // protected setInitialValue() {
  //   this.allProjectClients
  //     .pipe(take(1), takeUntil(this._onDestroy))
  //     .subscribe(() => {
  //       this.singleSelect.compareWith = (a: ProjectClient, b: ProjectClient) =>
  //         a && b && a.id === b.id;
  //     });
  // }

  protected filterClientProjects() {
    if (!this.projectClientAssign) {
      return;
    }

    let search = this.projectFilterCtrl.value;
    if (!search) {
      this.allProjectClients.next(this.projectClientAssign?.slice());
      return;
    } else {
      search = search.toLowerCase();
    }

    this.allProjectClients.next(
      this.projectClientAssign.filter(
        (clientProject) =>
          clientProject.projectName.toLowerCase().indexOf(search) > -1 ||
          clientProject.shortName.toLowerCase().indexOf(search) > -1
      )
    );
  }
}
