import { Component, ElementRef, Inject, OnInit, QueryList, ViewChildren } from '@angular/core';
import { AbstractControl, FormArray, FormBuilder, FormGroup, ValidationErrors, Validators } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { Util } from '../../../../libraries/Util';
import {
  MAT_DIALOG_DATA,
  MatDialog,
  MatDialogRef,
} from '@angular/material/dialog';
import { Client } from '../../../../models/client';
import { HttpErrorResponse } from '@angular/common/http';
import { ClientsService } from '../../services/client/clients.service';
import { ConfirmModalComponent } from '../../../shared/modals/confirm-modal/confirm-modal.component';
import { Messages } from '../../../../models/message-enum';
import { ResponsiblePersonDto } from '../../../../models/end-client.model';
import { MatSnackBar } from '@angular/material/snack-bar';
import { CustomValidators } from '../../../../custom-validator';

@Component({
  selector: 'app-create-clients',
  templateUrl: './create-clients.component.html',
  styleUrl: './create-clients.component.scss',
})
export class CreateClientsComponent implements OnInit {
  @ViewChildren('contactPersonBlock') contactPersonBlocks!: QueryList<ElementRef>;
  isCreatingClient = false;
  isEdit = false;
  status: any = [
    { value: 'ACTIVE', show: 'Active' },
    { value: 'INACTIVE', show: 'Inactive' },
  ];

  clientForm = this.fb.group({
    id: [''],
    shortName: [
      '',
      [
        Validators.required,
        Validators.minLength(2),
        Validators.maxLength(50),
        Validators.pattern(/^(?!.*<[^>]*>)(?!.*<\/[^>]*>).*$/),
      ],
    ],
    legalName: [
      '',
      [Validators.maxLength(100), Validators.pattern(/^(?!.*<[^>]*>)(?!.*<\/[^>]*>).*$/)],
    ],
    status: ['ACTIVE', [Validators.required, Validators.pattern('ACTIVE')]],
    contactPersons: this.fb.array([], CustomValidators.uniqueEmailValidator.bind(this))
  });

  constructor(
    public dialogRef: MatDialogRef<CreateClientsComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private fb: FormBuilder,
    public clientService: ClientsService,
    private toastr: ToastrService,
    private dialog: MatDialog,
    private readonly _snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    if (this.data !== null) {
      this.isEdit = true;
      this.clientForm.patchValue(this.data);
      // Clear existing contactPersons
      this.contactPersons.clear();

      // Populate contactPersons FormArray if data exists
      if (this.data.contactPersons && Array.isArray(this.data.contactPersons)) {
        this.data.contactPersons.forEach((person: ResponsiblePersonDto) => {
          this.addContactPerson(person);
        });
      } else {
        this.addContactPerson();
      }
    } else {
      // Add one empty contact person by default when creating
      this.addContactPerson();
    }
  }

  saveClientProfile(): void {
    if (this.data === null) {
      this.createClient(this.clientForm.value as Client);
    } else {
      this.editClient(this.data.id, this.clientForm.value as Client);
    }
  }

  createClient(clientData: Client): void {
    this.isCreatingClient = true;
    if (this.clientForm.valid) {
      // Save the client profile data
      this.clientService.createClient(clientData).subscribe({
        next: (response: any) => {
          if (response && response.status === 201) {
            const location = Util.extractFormId(
              response.headers.get('Location')
            );
            localStorage.setItem('formIdPath', location);
            this.dialogRef.close(true);
            this.showToasterSuccess('Client created successfully');
          }
        },
        error: (err: HttpErrorResponse) => {
          this.isCreatingClient = false;
          if(err.status === 409) {
            this.toastr.error('Client already exists');
            this.clientForm.get('shortName')?.setErrors({ 'duplicateClient': true });
          }
          console.log(err);
        },
      });
    } else {
      // Handle validation errors
      this.showToasterWarning('Form has validation errors.');
    }
  }

  editClient(clientId: string, clientData: Client): void {
    this.isCreatingClient = true;
    if (this.clientForm.valid) {
      // Update the client profile data
      this.clientService.updateClient(clientId, clientData).subscribe({
        next: (response: any) => {
          if (response.status === 200) {
            this.dialogRef.close(true);
            this.showToasterSuccess('Client updated successfully');
          }
        },
        error: (err: HttpErrorResponse) => {
          this.isCreatingClient = false;
          if(err.status === 409) {
            this.toastr.error('Client already exists');
            this.clientForm.get('shortName')?.setErrors({ 'duplicateClient': true });
          }
          console.log(err);
        },
      });
    } else {
      // Handle validation errors
      this.showToasterWarning('Form has validation errors.');
    }
  }

  closeDialog(isClosed: boolean): void {
    if (this.clientForm.dirty) {
      let dialogRef = this.dialog.open(ConfirmModalComponent, {
        panelClass: 'edit-modal',
        width: '445px',
        height: '220px',
        disableClose: true,
        data: [Messages.closeConfirm, '']
      });
      dialogRef.afterClosed().subscribe((result) => {
        if (result) {
          this.dialogRef.close();
        }
      });
    } else {
      this.dialogRef.close(isClosed);
    }
  }

  showToasterSuccess(message: string) {
    this.toastr.success(message, '', {
      timeOut: 10000,
    });
  }

  showToasterWarning(message: string) {
    this.toastr.warning(message, '', {
      timeOut: 10000,
    });
  }


  //--------------- Additional methods for managing contact persons can be added here ---------------
  get contactPersons(): FormArray {
    return this.clientForm.get('contactPersons') as FormArray;
  }

  addContactPerson(p?: ResponsiblePersonDto): void {
    const lastIndex = this.contactPersons.length - 1;
    if (
      this.contactPersons.length === 0 ||
      this.contactPersons.at(lastIndex).valid
    ) {
      this.contactPersons.push(this.createContactPersonGroup(p));
      setTimeout(() => {
        const blocks = this.contactPersonBlocks.toArray();
        if (blocks.length) {
          blocks[blocks.length - 1].nativeElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      });
    } else {
      this._snackBar.open('Please fill the fields for the previous contact person before adding a new one.',undefined,{ duration: 5000});
    }
  }

  removeContactPerson(index: number): void {
    if (this.contactPersons.length > 1) {
      this.contactPersons.removeAt(index);
    }
  }
  createContactPersonGroup(contactPerson?: ResponsiblePersonDto): FormGroup {
    return this.fb.group({
      id:        [contactPerson?.id ?? ''],
      firstName: [contactPerson?.firstName ?? '', [Validators.required,
        Validators.minLength(2),
        Validators.maxLength(50)
      ]],
      lastName:  [contactPerson?.lastName  ?? '', [Validators.required,
        Validators.minLength(2),
        Validators.maxLength(50)
      ]],
      email:     [contactPerson?.email     ?? '', [Validators.required, Validators.email,
        Validators.pattern(/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,10}$/)]]
    });
  }
}
