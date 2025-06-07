import { Component, Inject, OnInit } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialog, MatDialogRef } from '@angular/material/dialog';
import { ClientsService } from '../../services/client/clients.service';
import { EndClient } from '../../../../models/endClient';
import { ConfirmModalComponent } from '../../../shared/modals/confirm-modal/confirm-modal.component';
import { Messages } from '../../../../models/message-enum';
import { EndclientService } from '../../../shared/services/end-client/endclient.service';
import { ToastrService } from 'ngx-toastr';
import { ResponsiblePersonDto } from '../../../../models/end-client.model';
import { MatSnackBar } from '@angular/material/snack-bar';
import { CustomValidators } from '../../../../custom-validator';

@Component({
  selector: 'app-dialog-create-end-client',
  templateUrl: './dialog-create-end-client.component.html',
  styleUrl: './dialog-create-end-client.component.scss'
})
export class DialogCreateEndClientComponent implements OnInit {
  form!: FormGroup;
  isEdit = false;

  constructor(
    private fb: FormBuilder,
    private dialog: MatDialog,
    private toastr: ToastrService,
    private dialogRef: MatDialogRef<DialogCreateEndClientComponent>,
    public clientService: ClientsService,
    public endClientService: EndclientService,
    private readonly _snackBar: MatSnackBar,
    @Inject(MAT_DIALOG_DATA) public data?: EndClient
  ) {}

  ngOnInit(): void {
    this.form = this.fb.group({
      endClientName: ['', [Validators.required,
        Validators.minLength(2),
        Validators.maxLength(100)]],
      responsiblePersons: this.fb.array([], CustomValidators.uniqueEmailValidator.bind(this))
    });

    // if data passed in, it's an edit
    if (this.data) {
      this.isEdit = true;
      this.form.get('endClientName')!.setValue(this.data.endClientName);
      this.data.responsiblePersons?.forEach(p => this.addPerson(p));
    } else {
      this.addPerson(); // at least one
    }
  }

  showToasterSuccess(message: string) {
    this.toastr.success(message, '', {
      timeOut: 10000,
    });
  }

  get persons(): FormArray {
    return this.form.get('responsiblePersons') as FormArray;
  }

  createPersonGroup(p?: ResponsiblePersonDto): FormGroup {
    return this.fb.group({
      id:        [p?.id || ''],
      firstName: [p?.firstName || '', [Validators.required,
        Validators.minLength(2),
        Validators.maxLength(50),
        // Validators.pattern(/^(?!.*<[^>]*>)(?!.*<\/[^>]*>)(?!.*[0-9@#\$%\^&\*\(\)_\+\=\[\]\{\}\\|;:'",<>\.\?/]).*$/)
      ]],
      lastName:  [p?.lastName  || '', [Validators.required,
        Validators.minLength(2),
        Validators.maxLength(50),
        // Validators.pattern(/^(?!.*<[^>]*>)(?!.*<\/[^>]*>)(?!.*[0-9@#\$%\^&\*\(\)_\+\=\[\]\{\}\\|;:'",<>\.\?/]).*$/)
      ]],
      email:     [p?.email     || '', [Validators.email,
        Validators.pattern(/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,10}$/)]]
    });
  }

  addPerson(p?: ResponsiblePersonDto): void {
    const lastIndex = this.persons.length - 1;
    if (
      this.persons.length === 0 ||
      this.persons.at(lastIndex).valid
    ) {
      this.persons.push(this.createPersonGroup(p));
    } else {
      this._snackBar.open('Please fill the fields for the previous responsible person before adding a new one.',undefined,{ duration: 5000});
    }
    // this.persons.push(this.createPersonGroup(p));
  }

  removePerson(index: number): void {
    if (this.persons.length > 1) {
      this.persons.removeAt(index);
    }
  }

  onSave(): void {
    if (this.form.invalid) return;
    const payload: any = {
      ...(this.data && this.data.id ? { id: this.data.id } : {}),
      ...this.form.value
    };

    const call$ = this.isEdit
      ? this.endClientService.updateEndClient(payload)
      : this.endClientService.createEndClient(payload);

    call$.subscribe({
      next: (created: any) => {
        this.dialogRef.close(created);
        this.showToasterSuccess(this.isEdit ? 'End Client updated successfully' : 'End Client created successfully');
      },
      error: (err: any)  => {
        if(err.status === 409) {
          this.toastr.error('End Client already exists');
          this.form.get('endClientName')?.setErrors({ 'duplicateEndClient': true });
        }
      }
    });
  }

  onCancel(): void {
    this.dialogRef.close();
  }

  closeDialog(isClosed: boolean): void {
      if (this.form.dirty) {
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
}

