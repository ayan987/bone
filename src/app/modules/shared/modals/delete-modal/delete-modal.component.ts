import { Component, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

@Component({
  selector: 'app-delete-modal',
  templateUrl: './delete-modal.component.html',
  styleUrl: './delete-modal.component.scss'
})
export class DeleteModalComponent {
  constructor(public dialogRef: MatDialogRef<DeleteModalComponent>,  @Inject(MAT_DIALOG_DATA) public content: any,) { }

  closeDialog(isCheck: boolean): void {
    this.dialogRef.close(isCheck);
  }
}
