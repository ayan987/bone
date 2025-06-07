import { Component } from '@angular/core';

@Component({
  selector: 'app-session-expired-dialog',
  template: `
    <h1 mat-dialog-title>Session Expired</h1>
    <div mat-dialog-content>Your session has expired. Please login again.</div>
    <div mat-dialog-actions>
      <button mat-button [mat-dialog-close]="true">OK</button>
    </div>
  `
})
export class SessionExpiredDialogComponent {}
