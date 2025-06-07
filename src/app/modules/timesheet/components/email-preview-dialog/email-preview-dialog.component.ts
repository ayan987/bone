import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { Util } from '../../../../libraries/Util';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ToastrService } from 'ngx-toastr';
import { TimesheetService } from '../../services/timesheet/timesheet.service';
import { SafeHtml } from '@angular/platform-browser';

export interface EmailPreviewData {
  subject: string;
  htmlBody: SafeHtml;
  attachmentFileName: string;
  generatedTSPath: string;
  email: string;
  clientEmail: string;
  cc: string;
}

@Component({
  selector: 'app-email-preview-dialog',
  templateUrl: './email-preview-dialog.component.html',
  styleUrl: './email-preview-dialog.component.scss'
})
export class EmailPreviewDialogComponent {
  constructor(
    public dialogRef: MatDialogRef<EmailPreviewDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: EmailPreviewData,
    private readonly _snackBar: MatSnackBar,
    private readonly timesheetService: TimesheetService,
    private readonly toastr: ToastrService
  ) {}

  /** Download the generated timesheet */
  downloadAttachment(timesheetUrl: string | undefined): void {
    if (timesheetUrl) {
      const snackBarRef = this._snackBar.open('Downloading...');
      const fileId = Util.getFileId(timesheetUrl);
      const fileName = Util.getFileName(timesheetUrl);
      const requestObj = {
        fileId: fileId,
        fileName: fileName,
        token: localStorage.getItem('token')?.slice(1, -1)
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
        }
      });
    } else {
      this.toastr.error('Timesheet Path does not exist', '', {
        timeOut: 5000,
        closeButton: true,
      });
    }
  }

  closeDialog(): void {
    this.dialogRef.close();
  }
}
