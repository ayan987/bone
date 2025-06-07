import { Component, Inject, OnInit } from '@angular/core';
import {
  MatDialogRef,
  MAT_DIALOG_DATA,
} from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ToastrService } from 'ngx-toastr';
import { Util } from '../../../../libraries/Util';
import { TimesheetService } from '../../services/timesheet/timesheet.service';
import { GeneratedTimesheet } from '../../../../models/generated-timesheet';
import { FilterCriteria } from '../../../../models/active-consultant-filter';
import { ActiveConsultantService } from '../../services/active-consultant/active-consultant.service';
import { TimesheetTabEnum } from '../../../../models/Timesheettab.enum';
import { TimesheetStatus } from '../../../../models/timesheet-status-enum';

@Component({
  selector: 'app-view-unmatched-import',
  templateUrl: './view-unmatched-import.component.html',
  styleUrl: './view-unmatched-import.component.scss',
})
export class ViewUnmatchedImportComponent implements OnInit {
  util = new Util();
  tsGenerated = TimesheetStatus.generated;
  emailSent = TimesheetStatus.sent;
  tableHead: string = TimesheetTabEnum.matchTimesheet;
  dataSource: GeneratedTimesheet[] = [];
  filterCriteria: FilterCriteria = {};
  matchTimesheetData: any;
  displayedColumns: string[] = [
    'project',
    'abruf',
    'consultant',
    'poNumber',
    'importDate',
    'monthYear',
    'hours',
    'actions',
  ];
  constructor(
    public dialogRef: MatDialogRef<ViewUnmatchedImportComponent>,
    @Inject(MAT_DIALOG_DATA) public unmatchedData: any,
    private readonly timesheetService: TimesheetService,
    private readonly toastr: ToastrService,
    private readonly _snackBar: MatSnackBar,
    private readonly activeConsultantService: ActiveConsultantService
  ) {}

  ngOnInit(): void {
    const getMonthYear = Util.extractMonthAndYear(this.unmatchedData[0].mappedData.reportMonth);
    this.filterCriteria = {
      month: getMonthYear.month,
      year: getMonthYear.year,
      tsGenerationStatus: [this.emailSent, this.tsGenerated]
    }
    const { year, month } = this.filterCriteria;

    if (
      year  != null &&
      month != null &&
      !isNaN(year) &&
      !isNaN(month) &&
      year != undefined &&
      month != undefined
    ) {
      this.fetchMatchedTimesheets();
    } else {
      this.toastr.error("Wrong year/month filtered");
    }
  }

  fetchMatchedTimesheets(): any {
    this.activeConsultantService.getTimesheets(this.filterCriteria).subscribe({
      next: (response: any) => {
        this.dataSource = response.body;
      },
      error: (err) => {
        console.error(err);
      },
    });
  }

  applyNewFilterCriteria(newCriteria: Partial<FilterCriteria>): void {
    const getMonthYear = Util.extractMonthAndYear(this.unmatchedData[0].mappedData.reportMonth);
    this.filterCriteria = {
      ...newCriteria,
      month: getMonthYear.month,
      year: getMonthYear.year,
      tsGenerationStatus: [this.emailSent, this.tsGenerated]
    }
    this.dataSource = [];
    this.fetchMatchedTimesheets();
  }


  closeDialog(isClosed: boolean): void {
    this.dialogRef.close(isClosed);
  }

  /** Download the imported timesheet */
  downloadImportedTimesheet(eTag: string, excelFileName: string): void {
    if (eTag && excelFileName) {
      const snackBarRef = this._snackBar.open('Downloading...');
      const fileId = Util.extractUUID(eTag);
      const fileName = excelFileName;
      const requestObj = {
        fileId: fileId,
        fileName: fileName,
        token: localStorage.getItem('token')?.slice(1, -1),
      };
      this.timesheetService.downloadGeneratedTimesheet(requestObj).subscribe({
        next: (response: any) => {
          const blob = response.body;
          if (blob && blob.size !== 0) {
            const link = document.createElement('a');
            link.href = window.URL.createObjectURL(blob);
            link.setAttribute('download', fileName);
            link.click();
            snackBarRef.dismiss();
          } else {
            snackBarRef.dismiss();
            this.toastr.error('File does not exist', '', {
              timeOut: 5000,
              closeButton: true,
            });
          }
        },
        error: (err) => {
          console.error(err);
        },
      });
    } else {
      this.toastr.error('File does not exist', '', {
        timeOut: 5000,
        closeButton: true,
      });
    }
  }

    /** Return the display-string for “hours” (either totalHours or onsite+remote) */
  getHoursString(element: any): string {
    const m = element.mappedData;
    // prefer totalHours if present, otherwise sum onsite+remote
    const h =
      m.totalHours != null
        ? (m.totalHours ?? 0)
        : (m.totalOnsiteHours ?? 0) + (m.totalRemoteHours ?? 0);
    return h.toString();
  }
}
