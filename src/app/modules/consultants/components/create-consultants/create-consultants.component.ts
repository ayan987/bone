import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialog, MatDialogRef } from '@angular/material/dialog';
import { ConsultantStatus } from '../../../../models/consultants-status-enum';
import { ConfirmModalComponent } from '../../../shared/modals/confirm-modal/confirm-modal.component';
import { Messages } from '../../../../models/message-enum';
import { Consultant } from '../../../../models/consultant';
import { HttpErrorResponse } from '@angular/common/http';
import { ToastrService } from 'ngx-toastr';
import { ConsultantService } from '../../../shared/services/consultant/consultant.service';

@Component({
  selector: 'app-create-consultants',
  templateUrl: './create-consultants.component.html',
  styleUrl: './create-consultants.component.scss',
})
export class CreateConsultantsComponent implements OnInit {
  isCreatingConsultant = false;
  createConsultantForm = this.fb.group({
    id: [''],
    firstName: [
      '',
      [
        Validators.required,
        Validators.minLength(2),
        Validators.maxLength(50),
        Validators.pattern( /^(?!.*<[^>]*>)(?!.*<\/[^>]*>)(?!.*[0-9@#\$%^&*()_+=\[\]{}\\|;:'",<>.?\/]).*$/u )
      ]
    ],
    lastName: ['',
      [
        Validators.required,
        Validators.minLength(2),
        Validators.maxLength(50),
        Validators.pattern(/^(?!.*<[^>]*>)(?!.*<\/[^>]*>)(?!.*[0-9@#\$%\^&\*\(\)_\+=\[\]\{\}\\|;:'",<>\.\?/]).*$/u)
      ]
    ],
    email: ['',
      [
        Validators.required,
        Validators.email,
        Validators.pattern( /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,20}$/ )
      ]
    ],
    clientEmail: ['',
      [
        Validators.email,
        Validators.pattern( /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,20}$/ )
      ]
    ],
    status: [ConsultantStatus.Active],
  });

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: any,
    private fb: FormBuilder,
    public dialogRef: MatDialogRef<CreateConsultantsComponent>,
    private dialog: MatDialog,
    private toastr: ToastrService,
    private consultantService: ConsultantService
  ) {}

  ngOnInit(): void {
    this.patchConsultantValues(this.data);
  }

  patchConsultantValues(consultant: any): void {
    this.createConsultantForm.patchValue(consultant);
  }

  closeDialog(isClosed: boolean): void {
    if (this.createConsultantForm.dirty) {
      let dialogRef = this.dialog.open(ConfirmModalComponent, {
        panelClass: 'edit-modal',
        width: '445px',
        height: '220px',
        disableClose: true,
        data: [Messages.closeConfirm, '']
      });
      dialogRef.afterClosed().subscribe((result: any) => {
        if (result) {
          this.dialogRef.close();
        }
      });
    } else {
      this.dialogRef.close(isClosed);
    }
  }

  saveConsultant(): void {
    if (this.data === null) {
      this.createConsultant(this.createConsultantForm?.value as Consultant);
    } else {
      this.editConsultant(this.data.id, this.createConsultantForm?.value as Consultant);
    }
  }

  createConsultant(consultantData: Consultant): void {
    this.isCreatingConsultant = true;
    if (this.createConsultantForm.valid) {
      // Save the client profile data
      this.consultantService.createConsultant(consultantData).subscribe({
        next: (response: any) => {
          if (response && response.status === 201) {
            this.dialogRef.close(true);
            this.toastr.success('Consultant created successfully');
          }
        },
        error: (err: HttpErrorResponse) => {
          this.isCreatingConsultant = false;
          if(err.status === 409) {
            this.toastr.error('Consultant already exists');
            this.createConsultantForm.get('email')?.setErrors({ 'duplicateEmail': true });
          }
          console.log(err);
        },
      });
    } else {
      // Handle validation errors
      this.toastr.error('Form has validation errors.');
    }
  }

  editConsultant(consultantId: string, consultantData: Consultant): void {
    this.isCreatingConsultant = true;
    this.consultantService.editConsultant(consultantId, consultantData).subscribe({
      next: (response: any) => {
        if (response && response.status === 200) {
          this.dialogRef.close(true);
          this.toastr.success('Consultant updated successfully');
        }
      },
      error: (err: HttpErrorResponse) => {
        this.isCreatingConsultant = false;
        if(err.status === 409) {
          this.toastr.error('Consultant already exists');
          this.createConsultantForm.get('email')?.setErrors({ 'duplicateEmail': true });
        }
        console.log(err);
      },
    });
  }
}
