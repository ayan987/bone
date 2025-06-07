import { Component, Inject, OnInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

@Component({
  selector: 'app-timesheet-regeneration-result-dialog',
  templateUrl: './timesheet-regeneration-result-dialog.component.html',
  styleUrl: './timesheet-regeneration-result-dialog.component.scss'
})
export class TimesheetRegenerationResultDialogComponent implements OnInit {
  displayedColumns: string[] = ['Status', 'poNo', 'monthYear', 'abrufNo', 'name'];
  message: string = '';
  heading: string = 'Timesheet Regeneration';
  showGoToTimesheets = false;
  tableHead = '';

  constructor(
    public dialogRef: MatDialogRef<TimesheetRegenerationResultDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {
    if (data?.savedConsultants && data.savedConsultants.length > 0) {
      this.message = `Stared processing ${data.savedConsultants.length} suppliers out of ${data.selectedConsultants.length} selected for timesheet re-generation.`;
      this.showGoToTimesheets = true;
    } else {
      this.message = 'Cannot generate timesheet for the consultant(s).';
    }
    this.tableHead = `Regeneration of timesheet for following ${data.notSavedEntries?.length} suppliers was not possible.`;
  }
  ngOnInit(): void {
  }

  closeDialog(value: boolean): void {
    this.dialogRef.close(value);
  }
}
