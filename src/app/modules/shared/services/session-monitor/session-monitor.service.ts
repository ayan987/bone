import { Injectable } from '@angular/core';
import { MsalService } from '@azure/msal-angular';
import { MatDialog } from '@angular/material/dialog';
import { SessionExpiredDialogComponent } from '../../../../components/session-expired-dialog/session-expired-dialog.component';

@Injectable({
  providedIn: 'root'
})
export class SessionMonitorService {
  private checkInterval: any;
  private isDialogOpen = false;

  constructor(
    private msalService: MsalService,
    private dialog: MatDialog
  ) {}

  /**
   * Call this once (e.g. in AppComponent) to start periodic session checks
   */
  startMonitoring() {
    // Check every minute (60000 ms) if the token is expired.
    this.checkInterval = setInterval(() => {
      this.checkSessionExpiry();
    }, 60_000);
  }

  stopMonitoring() {
    if (this.checkInterval) {
      clearInterval(this.checkInterval);
      this.checkInterval = null;
    }
  }

  /**
   * Examines the ID token expiry in local storage/MSAL’s active account.
   * If expired, opens the session-expired dialog.
   */
  private checkSessionExpiry() {
    const account = this.msalService.instance.getActiveAccount();
    // If user is not logged in, do nothing.
    if (!account) {
      return;
    }

    // MSAL stores ID token claims in account.idTokenClaims
    const idTokenClaims = account.idTokenClaims as any; // cast to `any` or a custom type
    if (idTokenClaims) {
      const exp = idTokenClaims.exp; // 'exp' is in seconds since epoch
      const nowInSeconds = Math.floor(Date.now() / 1000);
      
      // If current time >= token expiration time => session is expired
      if (nowInSeconds >= exp && !this.isDialogOpen) {
        this.openSessionExpiredDialog();
      }
    }
  }

  private openSessionExpiredDialog() {
    this.isDialogOpen = true;

    // Open the dialog. The user must click OK to dismiss it.
    this.dialog.open(SessionExpiredDialogComponent, {
      disableClose: true  // user cannot close by clicking outside
    })
    .afterClosed()
    .subscribe(() => {
      this.isDialogOpen = false;
      this.msalService.logoutRedirect({ postLogoutRedirectUri: '/' });
    });
  }
}
