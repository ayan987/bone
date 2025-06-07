import { Component, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import moment from 'moment';

@Component({
  selector: 'app-check-unmatched-imports',
  templateUrl: './check-unmatched-imports.component.html',
  styleUrl: './check-unmatched-imports.component.scss',
})
export class CheckUnmatchedImportsComponent {
  displayedColumns: string[] = [
    'project',
    'abruf',
    'consultant',
    'poNumber',
    'importDate',
    'monthYear',
    // 'hours'
  ];

  displayedColumnsTimesheet: string[] = [
    'project',
    'abruf',
    'consultant',
    'poNumber',
    'pgName',
    'monthYear',
    // 'status'
  ];

  unmatchedData: any[] =[];
  matchedData: any[] =[];
  constructor(
    public dialogRef: MatDialogRef<CheckUnmatchedImportsComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {}

  closeDialog(isCheck: boolean): void {
    this.dialogRef.close(isCheck);
  }

  formatMonthYear(month: string | number, year: string | number): string {
    const monthNumber = Number(month);
    const yearNumber = Number(year);
    const date = moment({ year: yearNumber, month: monthNumber - 1 });
    return date.format('MMM YYYY');
  }
}
