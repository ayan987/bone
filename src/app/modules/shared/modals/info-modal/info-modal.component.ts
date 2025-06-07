import { Component, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

@Component({
  selector: 'app-info-modal',
  templateUrl: './info-modal.component.html',
  styleUrl: './info-modal.component.scss'
})
export class InfoModalComponent {
  constructor(public dialogRef: MatDialogRef<InfoModalComponent>,  @Inject(MAT_DIALOG_DATA) public content: any) { }

  closeDialog(isCheck: boolean): void {
    this.dialogRef.close(isCheck);
  }
}
