import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'app-client-modal',
  templateUrl: './confirm-modal.component.html',
  styleUrl: './confirm-modal.component.scss'
})
export class ConfirmModalComponent {

  constructor(public dialogRef: MatDialogRef<ConfirmModalComponent>, @Inject(MAT_DIALOG_DATA) public content: any) { }

  closeDialog(isCheck: boolean): void {
    this.dialogRef.close(isCheck);
  }
}
