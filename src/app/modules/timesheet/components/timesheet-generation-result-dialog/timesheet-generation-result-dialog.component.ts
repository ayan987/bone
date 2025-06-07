import { Component, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

@Component({
  selector: 'app-timesheet-generation-result-dialog',
  templateUrl: './timesheet-generation-result-dialog.component.html',
  styleUrl: './timesheet-generation-result-dialog.component.scss'
})
export class TimesheetGenerationResultDialogComponent {
  displayedColumns: string[] = ['reason', 'poNo', 'monthYear', 'abrufNo', 'name'];
  message: string = '';
  heading: string = 'Timesheet Generation';
  showGoToTimesheets = false;
  tableHead = '';

  constructor(
    public dialogRef: MatDialogRef<TimesheetGenerationResultDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {
    if (data?.savedEntriesCount && data.savedEntriesCount > 0) {
      this.message = `Successfully added ${data.savedEntriesCount} suppliers out of ${data.selectedConsultants} selected for timesheet generation.`;
      this.showGoToTimesheets = true;
    } else {
      this.message = 'Cannot generate timesheet for the consultant(s).';
    }
    this.tableHead = `Following ${data.notSavedEntries.length} suppliers could not be added.`;
  }

  closeDialog(value: boolean): void {
    this.dialogRef.close(value);
  }
}
